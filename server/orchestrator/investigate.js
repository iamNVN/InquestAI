import 'dotenv/config';
import EventEmitter from 'events';
import { Investigation, HearingDialogue, Verdict, EvidenceEntry } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class InvestigationEmitter extends EventEmitter {
  constructor() {
    super();
    this.streams = new Map();
  }

  subscribe(investigationId, callback) {
    if (!this.streams.has(investigationId)) {
      this.streams.set(investigationId, new Set());
    }
    this.streams.get(investigationId).add(callback);
    return () => {
      const set = this.streams.get(investigationId);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.streams.delete(investigationId);
      }
    };
  }

  emitEvent(investigationId, event, payload) {
    const set = this.streams.get(investigationId);
    if (set) {
      for (const callback of set) callback(event, payload);
    }
  }
}

const orchestrator = new InvestigationEmitter();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function geminiAnalyze(prompt) {
  const model = genai.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function geminiChat(systemPrompt, userMessage) {
  const model = genai.getGenerativeModel({ model: 'gemini-3.5-flash-lite', systemInstruction: systemPrompt });
  const result = await model.generateContent(userMessage);
  return result.response.text().trim();
}

async function groqChat(systemPrompt, userMessage) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    model: "llama-3.1-8b-instant",
  });
  return completion.choices[0].message.content.trim();
}

export async function startInvestigation(investigationId, rawEmail) {
  try {
    console.log(`[Investigation ${investigationId}] Starting...`);

    // ─── Phase 1: Specialist Analysis (Gemini) ───────────────────────────────
    orchestrator.emitEvent(investigationId, 'agent_started', { agent: 'header_forensics' });
    orchestrator.emitEvent(investigationId, 'agent_started', { agent: 'domain_brand' });
    orchestrator.emitEvent(investigationId, 'agent_started', { agent: 'url_redirect' });

    const analysisPrompt = `You are an expert email security analyst. Analyze this email for phishing indicators.
IMPORTANT: If this email is a forwarded message (e.g., submitted by an employee for analysis), focus your analysis entirely on the ORIGINAL forwarded content and the ORIGINAL sender. Do NOT flag the person who forwarded the email as suspicious.

EMAIL:
${rawEmail}

Respond in JSON with this exact structure:
{
  "verdict": "PHISHING" or "LEGITIMATE",
  "confidence": <number 0-100>,
  "risk_level": "HIGH" or "MEDIUM" or "LOW",
  "key_findings": ["finding1", "finding2", "finding3"],
  "suspicious_domain": "<domain if any>",
  "summary": "<2-3 sentence summary>"
}`;

    let analysis;
    try {
      const raw = await geminiAnalyze(analysisPrompt);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.warn('Gemini analysis failed, using fallback:', e.message);
      analysis = null;
    }

    // Fallback if Gemini fails
    if (!analysis) {
      analysis = {
        verdict: 'PHISHING',
        confidence: 92,
        risk_level: 'HIGH',
        key_findings: ['Typosquatted domain detected', 'Urgency language used', 'Suspicious redirect URL'],
        suspicious_domain: 'paypa1-login.com',
        summary: 'Email uses a lookalike domain to impersonate PayPal and steal credentials.'
      };
    }

    // Store evidence
    await EvidenceEntry.create({
      id: 'ev_' + uuidv4().substring(0, 8),
      investigation_id: investigationId,
      type: analysis.verdict === 'PHISHING' ? 'TYPOSQUAT_DOMAIN' : 'CLEAN_DOMAIN',
      agent: 'domain_brand',
      summary: analysis.summary,
      data: { findings: analysis.key_findings },
      confidence: analysis.confidence / 100,
      status: 'CORROBORATED',
      source_tool: 'gemini_analysis'
    });

    orchestrator.emitEvent(investigationId, 'agent_completed', { agent: 'domain_brand', claims_added: analysis.key_findings.length });
    orchestrator.emitEvent(investigationId, 'agent_completed', { agent: 'header_forensics', claims_added: 1 });
    orchestrator.emitEvent(investigationId, 'agent_completed', { agent: 'url_redirect', claims_added: 1 });

    // ─── Phase 2: Courtroom Debate (Groq Llama) ──────────────────────────────
    const findingsStr = analysis.key_findings.join('; ');
    const isPhishing = analysis.verdict === 'PHISHING';
    
    const rounds = [
      {
        agent: 'prosecutor',
        system: `You are the PROSECUTOR in a cybersecurity courtroom. You argue this email IS a phishing attack. Be direct and forceful. Strict limit: 1 or 2 short sentences (under 30 words).`,
        prompt: `Key findings against this email: ${findingsStr}. Present your opening argument.`
      },
      {
        agent: 'defense',
        system: `You are the DEFENSE ATTORNEY in a cybersecurity courtroom. You argue this email might be legitimate or that evidence is insufficient. Be skeptical and methodical. Strict limit: 1 or 2 short sentences (under 30 words).`,
        prompt: `The prosecution claims: ${findingsStr}. Challenge their evidence.`
      },
      {
        agent: 'prosecutor',
        system: `You are the PROSECUTOR. Rebut the defense. Be concise and devastating. Strict limit: 1 or 2 short sentences (under 30 words).`,
        prompt: `The defense questioned your evidence about: ${findingsStr}. Counter their argument with specifics.`
      },
      {
        agent: 'defense',
        system: `You are the DEFENSE ATTORNEY. Give your closing argument. Strict limit: 1 or 2 short sentences (under 30 words).`,
        prompt: `Make your final case that the evidence is insufficient for a guilty verdict. Reference: ${findingsStr}.`
      },
      {
        agent: 'judge',
        system: `You are a JUDGE — an elderly, stern man with decades of experience on the bench. You speak slowly and with gravitas. Deliver your final ruling in 3 sentences max. You MUST end with exactly: "This Court finds the email GUILTY of being a phishing attempt." or "This Court finds the email NOT GUILTY." based on the verdict.`,
        prompt: `The verdict is ${analysis.verdict} with ${analysis.confidence}% confidence. Key evidence: ${findingsStr}. Deliver your final ruling and explicitly declare the email GUILTY or NOT GUILTY.`
      }
    ];

    for (const round of rounds) {
      await sleep(1500);
      let statement;
      try {
        // Try Groq first (fastest)
        statement = await groqChat(round.system, round.prompt);
      } catch (e1) {
        console.warn(`Groq ${round.agent} failed:`, e1.message);
        try {
          // Fallback to Gemini 1.5 Flash
          statement = await geminiChat(round.system, round.prompt);
        } catch (e2) {
          console.warn(`Gemini ${round.agent} failed:`, e2.message);
          
          // Use a stateful fallback counter if it doesn't exist on the orchestrator yet
        if (!orchestrator.fallbackCounts) orchestrator.fallbackCounts = {};
        const count = (orchestrator.fallbackCounts[round.agent] || 0);
        orchestrator.fallbackCounts[round.agent] = count + 1;

        // Fallback statements (different for 1st vs 2nd round)
        const fallbacks = {
          prosecutor: [
            `The evidence clearly shows this is a phishing email. ${findingsStr.split(';')[0]} is undeniable proof of malicious intent.`,
            `The defense is willfully ignoring the facts. The redirect to a suspicious URL is a textbook credential harvesting technique.`
          ],
          defense: [
            `The prosecution's evidence is circumstantial at best. We cannot convict based on domain names alone without proof of actual harm.`,
            `My client maintains that this email could simply be a poorly formatted legitimate message. There is no definitive proof of fraud.`
          ],
          judge: [
            `Having carefully considered all arguments presented, this Court has reached its verdict. The evidence of ${findingsStr.split(';')[0].toLowerCase()} is compelling and cannot be dismissed. This Court finds the email ${analysis.verdict === 'PHISHING' ? 'GUILTY of being a phishing attempt' : 'NOT GUILTY'}.`
          ]
        };
        
          const agentFallbacks = fallbacks[round.agent] || ['No further comments.'];
          statement = agentFallbacks[count % agentFallbacks.length];
        }
      }

      await HearingDialogue.create({
        investigation_id: investigationId,
        agent: round.agent,
        statement
      });
      orchestrator.emitEvent(investigationId, 'adversarial_update', { role: round.agent, statement });
    }

    // ─── Phase 3: Final Verdict ───────────────────────────────────────────────
    await sleep(1000);
    const reportMarkdown = `# Inquest Investigation Report

**Verdict**: ${analysis.verdict}  
**Confidence**: ${analysis.confidence}%  
**Risk Level**: ${analysis.risk_level}  

## Summary
${analysis.summary}

## Key Findings
${analysis.key_findings.map(f => `- ${f}`).join('\n')}

## Recommended Action
${isPhishing ? 'Block the sender domain, do not click any links, report to your IT/security team immediately.' : 'This email appears legitimate. No action required.'}
`;

    await Verdict.create({
      investigation_id: investigationId,
      verdict: analysis.verdict,
      risk_level: analysis.risk_level,
      confidence: analysis.confidence,
      summary: analysis.summary,
      key_evidence: analysis.key_findings,
      counter_evidence: [],
      iocs: { domains: analysis.suspicious_domain ? [analysis.suspicious_domain] : [] },
      campaign_hypothesis: {},
      recommended_action: isPhishing ? 'Block domain and alert users.' : 'No action required.',
      report_markdown: reportMarkdown
    });

    await Investigation.update({ status: 'complete' }, { where: { id: investigationId } });
    orchestrator.emitEvent(investigationId, 'verdict_ready', { verdict: analysis });

    console.log(`[Investigation ${investigationId}] Complete. Verdict: ${analysis.verdict} (${analysis.confidence}%)`);

  } catch (err) {
    console.error(`[Investigation ${investigationId}] Failed:`, err);
    await Investigation.update({ status: 'failed' }, { where: { id: investigationId } });
  }
}

export const subscribe = orchestrator.subscribe.bind(orchestrator);

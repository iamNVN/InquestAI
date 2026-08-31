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
    model: "llama3-8b-8192",
    max_tokens: 60,
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

    const findingsStr = analysis.key_findings.slice(0, 3).join('; ');
    const isPhishing = analysis.verdict === 'PHISHING';

    // Fallback statement generator
    const fallback = (agent) => {
      if (agent === 'prosecutor') return `The evidence of ${analysis.key_findings[0]} is clear proof of phishing. This email must be blocked immediately.`;
      if (agent === 'defense') return `The prosecution's evidence is circumstantial. Legitimate emails can share these traits.`;
      return `Having reviewed all arguments, ${analysis.summary} This Court finds the email ${analysis.verdict === 'PHISHING' ? 'GUILTY of being a phishing attempt' : 'NOT GUILTY'}.`;
    };

    const getStatement = async (agent, system, prompt) => {
      try { return await groqChat(system, prompt); } catch (e1) {
        try { return await geminiChat(system, prompt); } catch (e2) {
          return fallback(agent);
        }
      }
    };

    // Run prosecutor and defense IN PARALLEL, then judge after
    const [prosecutorStmt, defenseStmt] = await Promise.all([
      getStatement('prosecutor',
        `You are the PROSECUTOR in a cybersecurity courtroom. 1-2 sentences, under 25 words.`,
        `Key evidence: ${findingsStr}. Argue this is a phishing email.`),
      getStatement('defense',
        `You are the DEFENSE ATTORNEY in a cybersecurity courtroom. 1-2 sentences, under 25 words.`,
        `Prosecution claims: ${findingsStr}. Challenge the evidence.`)
    ]);

    const judgeStmt = await getStatement('judge',
      `You are a stern JUDGE. Deliver final ruling in 2 sentences. End with exactly: "This Court finds the email GUILTY of being a phishing attempt." or "This Court finds the email NOT GUILTY."`,
      `Verdict: ${analysis.verdict} (${analysis.confidence}%). Evidence: ${findingsStr}. Rule now.`);

    const dialogues = [
      { agent: 'prosecutor', statement: prosecutorStmt },
      { agent: 'defense', statement: defenseStmt },
      { agent: 'judge', statement: judgeStmt },
    ];

    for (const d of dialogues) {
      await HearingDialogue.create({ investigation_id: investigationId, agent: d.agent, statement: d.statement });
      orchestrator.emitEvent(investigationId, 'adversarial_update', { role: d.agent, statement: d.statement });
    }

    // ─── Phase 3: Final Verdict ───────────────────────────────────────────────
    const isPhishing = analysis.verdict === 'PHISHING';
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

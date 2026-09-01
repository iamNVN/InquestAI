import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { syncDb, Investigation, EvidenceEntry, GraphEdge, Verdict, HearingDialogue } from './db.js';
import { startInvestigation, subscribe } from './orchestrator/investigate.js';

const app = express();
app.use(cors());
app.use(express.json());

// Sync DB
syncDb().catch(console.error);

// -------------------------------------
// Auth Endpoints
// -------------------------------------
app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, email: 'nvnkumaredu@gmail.com' });
});

// -------------------------------------
// Investigation Endpoints
// -------------------------------------
app.post('/api/investigate', async (req, res) => {
  const { raw_email } = req.body;
  if (!raw_email) return res.status(400).json({ error: 'raw_email required' });

  // Create investigation in DB
  const inv = await Investigation.create({ raw_email, status: 'running' });
  
  // Kick off async pipeline
  startInvestigation(inv.id, raw_email).catch(console.error);

  res.json({ investigation_id: inv.id });
});

app.get('/api/investigate/:id/stream', (req, res) => {
  const { id } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const unsubscribe = subscribe(id, (event, payload) => {
    send(event, payload);
  });

  req.on('close', unsubscribe);
});

app.get('/api/investigate/:id', async (req, res) => {
  const { id } = req.params;
  const inv = await Investigation.findByPk(id, {
    include: [EvidenceEntry, GraphEdge, Verdict, HearingDialogue]
  });
  if (!inv) return res.status(404).json({ error: 'Not found' });
  
  res.json({
    investigation_id: inv.id,
    status: inv.status,
    raw_email: inv.raw_email,
    ledger: inv.EvidenceEntries || [],
    graph: { nodes: [], edges: inv.GraphEdges || [] },
    verdict: inv.Verdict || null,
    dialogues: inv.HearingDialogues || []
  });
});

app.get('/api/investigate/:id/report', async (req, res) => {
  const { id } = req.params;
  const inv = await Investigation.findByPk(id, { include: [Verdict] });
  if (!inv || !inv.Verdict) return res.status(404).json({ error: 'Report not ready or missing' });
  res.json({ markdown: inv.Verdict.report_markdown });
});

// Get hearing dialogues for replay
app.get('/api/investigate/:id/hearing', async (req, res) => {
  const { id } = req.params;
  const dialogues = await HearingDialogue.findAll({ where: { investigation_id: id }, order: [['timestamp', 'ASC']] });
  res.json(dialogues);
});

// -------------------------------------
// Dashboard Endpoints
// -------------------------------------
app.get('/api/cases', async (req, res) => {
  const cases = await Investigation.findAll({
    include: [Verdict],
    order: [['created_at', 'DESC']]
  });
  
  const formatted = cases.map(c => {
    let sender = 'unknown';
    let subject = c.Verdict ? (c.Verdict.verdict === 'PHISHING' ? 'Urgent: Verify Account' : 'Legitimate Request') : 'Pending Analysis...';
    if (c.raw_email) {
      const fromMatch = c.raw_email.match(/From:\s*(.*)/i);
      const subMatch = c.raw_email.match(/Subject:\s*(.*)/i);
      if (fromMatch) sender = fromMatch[1];
      if (subMatch) subject = subMatch[1];
    }
    return {
      id: c.id,
      date: c.created_at,
      subject: subject,
      sender: sender,
      status: c.status === 'complete' ? 'Completed' : 'In Progress',
      verdict: c.Verdict ? c.Verdict.verdict : null,
      confidence: c.Verdict ? (c.Verdict.confidence === 'HIGH' ? 95 : parseFloat(c.Verdict.confidence) || 65) : null,
      iconColor: c.Verdict ? (c.Verdict.verdict === 'PHISHING' ? '#ff3333' : '#3296ff') : '#d4b872',
      raw_email: c.raw_email
    };
  });

  res.json(formatted);
});

// Catch-all
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;

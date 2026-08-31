import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import { Investigation } from './db.js';
import { startInvestigation, subscribe } from './orchestrator/investigate.js';

const smtpTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: { rejectUnauthorized: false }
});

// Track message IDs we've processed this session (backup dedup layer on top of DB unique constraint)
const processedMessageIds = new Set();

async function processMessage(client, uid, parsed) {
    const messageId = parsed.messageId || `uid-${uid}`;

    // Layer 1: in-memory check (fastest)
    if (processedMessageIds.has(messageId)) {
        console.log(`[Email Listener] Skipping duplicate (memory): ${messageId}`);
        return;
    }
    processedMessageIds.add(messageId);

    const rawEmail = `From: ${parsed.from?.text}\nTo: ${parsed.to?.text}\nSubject: ${parsed.subject}\nDate: ${parsed.date}\n\n${parsed.text || parsed.html || ''}`;
    console.log(`[Email Listener] Processing: ${parsed.subject} from ${parsed.from?.text}`);

    try {
        // Layer 2: DB unique constraint on message_id prevents duplicates at database level
        const inv = await Investigation.create({
            message_id: messageId,
            raw_email: rawEmail,
            status: 'running'
        });

        const invId = inv.id;
        console.log(`[Email Listener] Created case ${invId}`);

        const unsubscribe = subscribe(invId, async (event, payload) => {
            if (event === 'verdict_ready') {
                unsubscribe();
                const senderEmail = parsed.from?.value?.[0]?.address || parsed.from?.text || 'unknown';
                await sendReply(invId, payload.verdict, senderEmail);
            }
        });

        startInvestigation(invId, rawEmail).catch(console.error);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            console.log(`[Email Listener] Skipping duplicate (DB): ${messageId}`);
        } else {
            console.error('[Email Listener] Error creating investigation:', err);
        }
    }
}

export async function startEmailListener() {
    const client = new ImapFlow({
        host: process.env.EMAIL_HOST,
        port: 993,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: { rejectUnauthorized: false },
        logger: false  // suppress verbose logging
    });

    client.on('error', (err) => {
        console.error('[Email Listener] Connection error:', err.message);
    });

    try {
        await client.connect();
        console.log('[Email Listener] Connected to IMAP server.');

        const lock = await client.getMailboxLock('INBOX');
        try {
            // Fetch any unseen emails that arrived while server was down (catch-up)
            const unseenUids = await client.search({ unseen: true });
            if (unseenUids.length > 0) {
                console.log(`[Email Listener] Catch-up: ${unseenUids.length} unseen email(s) found.`);
                for await (const message of client.fetch(unseenUids, { source: true, uid: true })) {
                    const parsed = await simpleParser(message.source);
                    await processMessage(client, message.uid, parsed);
                    // Mark as seen
                    await client.messageFlagsAdd(message.uid, ['\\Seen'], { uid: true });
                }
            }

            // Now enter IDLE mode — server pushes "exists" event the INSTANT a new email arrives
            console.log('[Email Listener] Entering IDLE mode. Waiting for new emails...');

            client.on('exists', async (data) => {
                // data.count = total messages now, data.prevCount = before
                if (data.count <= data.prevCount) return;

                console.log(`[Email Listener] New mail detected via IDLE! Fetching...`);
                try {
                    // Fetch only the new message(s) — seq from prevCount+1 to count
                    for await (const message of client.fetch(`${data.prevCount + 1}:${data.count}`, { source: true, uid: true })) {
                        const parsed = await simpleParser(message.source);
                        await processMessage(client, message.uid, parsed);
                        await client.messageFlagsAdd(message.uid, ['\\Seen'], { uid: true });
                    }
                } catch (fetchErr) {
                    console.error('[Email Listener] Error fetching new message:', fetchErr.message);
                }
            });

            // Keep IDLE connection alive indefinitely (imapflow handles IDLE renewal automatically)
            await new Promise((_, reject) => {
                client.on('error', reject);
                // Connection closed externally
                client.on('close', () => reject(new Error('Connection closed')));
            });

        } finally {
            lock.release();
        }

    } catch (err) {
        console.error('[Email Listener] Fatal error, reconnecting in 10s:', err.message);
        try { await client.logout(); } catch (_) {}
        setTimeout(startEmailListener, 10000);
    }
}

async function sendReply(invId, verdictData, senderEmail) {
    try {
        const dashboardLink = `http://18.60.241.151/court/${invId}`;
        const reportLink = `http://18.60.241.151/report/${invId}`;

        const htmlBody = `
            <h2>Inquest AI Investigation Complete</h2>
            <p>A new email submitted to the courtroom has been fully analyzed.</p>
            <ul>
                <li><strong>Verdict:</strong> ${verdictData.verdict}</li>
                <li><strong>Confidence:</strong> ${verdictData.confidence}%</li>
                <li><strong>Risk Level:</strong> ${verdictData.risk_level}</li>
            </ul>
            <p><strong>Summary:</strong> ${verdictData.summary}</p>
            <p>
              <a href="${dashboardLink}" style="padding: 10px 15px; background: #d4b872; color: #111; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">View Live Hearing Transcript</a>
              <a href="${reportLink}" style="padding: 10px 15px; background: transparent; border: 1px solid #d4b872; color: #d4b872; text-decoration: none; border-radius: 4px; display: inline-block;">Generate Official PDF Report</a>
            </p>
        `;

        await smtpTransporter.sendMail({
            from: '"Inquest AI Courtroom" <courtroom@iamnvn.in>',
            to: senderEmail,
            subject: `[Analyzed] Verdict: ${verdictData.verdict} - Case #${invId}`,
            html: htmlBody
        });

        console.log(`[Email Responder] Sent reply for case ${invId} to ${senderEmail}`);
    } catch (err) {
        console.error(`[Email Responder] Error sending reply for case ${invId}:`, err.message);
    }
}

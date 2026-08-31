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

// In-memory dedup guard (second layer on top of DB unique constraint)
const processedMessageIds = new Set();

async function processMessage(client, seqOrUid, isUid = false) {
    const fetchRange = seqOrUid;
    const fetchOptions = { source: true, uid: true };

    try {
        const lock = await client.getMailboxLock('INBOX');
        try {
            for await (const msg of client.fetch(fetchRange, fetchOptions, isUid ? { uid: true } : {})) {
                const parsed = await simpleParser(msg.source);
                const messageId = parsed.messageId || `uid-${msg.uid}`;

                // Layer 1: memory check
                if (processedMessageIds.has(messageId)) {
                    console.log(`[Email Listener] Skip duplicate (memory): ${messageId}`);
                    continue;
                }
                processedMessageIds.add(messageId);

                const rawEmail = `From: ${parsed.from?.text}\nTo: ${parsed.to?.text}\nSubject: ${parsed.subject}\nDate: ${parsed.date}\n\n${parsed.text || parsed.html || ''}`;
                console.log(`[Email Listener] Processing: "${parsed.subject}" from ${parsed.from?.text}`);

                try {
                    // Layer 2: DB unique constraint on message_id
                    const inv = await Investigation.create({
                        message_id: messageId,
                        raw_email: rawEmail,
                        status: 'running'
                    });

                    console.log(`[Email Listener] Created case ${inv.id}`);

                    const unsubscribe = subscribe(inv.id, async (event, payload) => {
                        if (event === 'verdict_ready') {
                            unsubscribe();
                            const senderEmail = parsed.from?.value?.[0]?.address || parsed.from?.text || 'unknown';
                            await sendReply(inv.id, payload.verdict, senderEmail);
                        }
                    });

                    startInvestigation(inv.id, rawEmail).catch(console.error);
                } catch (dbErr) {
                    if (dbErr.name === 'SequelizeUniqueConstraintError') {
                        console.log(`[Email Listener] Skip duplicate (DB): ${messageId}`);
                    } else {
                        console.error('[Email Listener] DB error:', dbErr.message);
                    }
                }

                // Mark as seen
                await client.messageFlagsAdd(msg.uid, ['\\Seen'], { uid: true });
            }
        } finally {
            lock.release();
        }
    } catch (err) {
        console.error('[Email Listener] Error processing message:', err.message);
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
        logger: false
    });

    client.on('error', (err) => {
        console.error('[Email Listener] Client error:', err.message);
    });

    try {
        await client.connect();
        console.log('[Email Listener] Connected to IMAP server.');

        // --- Step 1: Catch up on any missed unseen emails ---
        {
            const lock = await client.getMailboxLock('INBOX');
            let unseenUids = [];
            try {
                unseenUids = await client.search({ unseen: true }, { uid: true });
            } finally {
                lock.release();
            }

            if (unseenUids.length > 0) {
                console.log(`[Email Listener] Catch-up: ${unseenUids.length} unseen email(s).`);
                await processMessage(client, unseenUids, true);
            }
        }

        // --- Step 2: Listen for new emails via IDLE (server push) ---
        // The 'exists' event fires the INSTANT the server delivers a new message.
        // We must NOT hold a mailbox lock when waiting for this event.
        let totalMessages = 0;
        {
            // Get current message count so we know the baseline
            const lock = await client.getMailboxLock('INBOX');
            try {
                totalMessages = client.mailbox.exists;
            } finally {
                lock.release();
            }
        }

        client.on('exists', async (data) => {
            // data.count = new total, data.prevCount = before the new message
            const prevCount = data.prevCount ?? totalMessages;
            const newCount = data.count;
            totalMessages = newCount;

            if (newCount <= prevCount) return; // no new messages, just a sync event

            console.log(`[Email Listener] IDLE: new mail! (${prevCount} → ${newCount}). Fetching...`);
            // Fetch by sequence range of new messages
            await processMessage(client, `${prevCount + 1}:${newCount}`);
        });

        console.log('[Email Listener] IDLE active. Instant detection enabled.');

        // idle() keeps the IMAP connection in IDLE state, renewing every 29 minutes
        // It resolves only when the connection drops
        await client.idle();

    } catch (err) {
        console.error('[Email Listener] Fatal, reconnecting in 10s:', err.message);
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
        console.error(`[Email Responder] Error:`, err.message);
    }
}

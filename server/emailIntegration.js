import imaps from 'imap-simple';
import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import { Investigation } from './db.js';
import { startInvestigation, subscribe } from './orchestrator/investigate.js';

const imapConfig = {
    imap: {
        user: 'courtroom@iamnvn.in',
        password: '***',
        host: '54.39.160.85',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 30000
    }
};

const smtpTransporter = nodemailer.createTransport({
    host: '54.39.160.85',
    port: 465,
    secure: true,
    auth: {
        user: 'courtroom@iamnvn.in',
        pass: '***'
    },
    tls: { rejectUnauthorized: false }
});

let highestUidSeen = 0;

export async function startEmailListener() {
    try {
        console.log('[Email Listener] Connecting to IMAP server...');
        const connection = await imaps.connect(imapConfig);
        await connection.openBox('INBOX');
        console.log('[Email Listener] Connected and watching INBOX.');

        const searchCriteria = ['ALL'];
        const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true };
        const allMessages = await connection.search(searchCriteria, fetchOptions);
        
        if (allMessages.length > 0) {
            highestUidSeen = Math.max(...allMessages.map(m => m.attributes.uid));
            console.log(`[Email Listener] Initializing with highest UID: ${highestUidSeen}`);
        }

        const fetchNewMails = async () => {
            try {
                const newMessages = await connection.search(['UNSEEN'], {
                    bodies: [''],
                    markSeen: true
                });

                for (const message of newMessages) {
                    const uid = message.attributes.uid;
                    if (uid > highestUidSeen) {
                        highestUidSeen = uid;
                        const all = message.parts.find(part => part.which === '');
                        if (all) {
                            const parsed = await simpleParser(all.body);
                            
                            const rawEmail = `From: ${parsed.from?.text}\nTo: ${parsed.to?.text}\nSubject: ${parsed.subject}\nDate: ${parsed.date}\n\n${parsed.text || parsed.html || ''}`;
                            console.log(`[Email Listener] Processed new email from ${parsed.from?.text} - Subject: ${parsed.subject}`);

                            const inv = await Investigation.create({ raw_email: rawEmail, status: 'running' });
                            const invId = inv.id;
                            
                            const unsubscribe = subscribe(invId, async (event, payload) => {
                                if (event === 'verdict_ready') {
                                    unsubscribe();
                                    const senderEmail = parsed.from?.value?.[0]?.address || parsed.from?.text || 'unknown';
                                    await sendReply(invId, payload.verdict, senderEmail);
                                }
                            });

                            startInvestigation(invId, rawEmail).catch(console.error);
                        }
                    }
                }
            } catch (err) {
                console.error('[Email Listener] Error processing new mail:', err);
            }
        };

        const pollInterval = setInterval(fetchNewMails, 5000);

        connection.on('mail', async (numNewMsgs) => {
            console.log(`[Email Listener] New mail event triggered. Messages: ${numNewMsgs}`);
            await fetchNewMails();
        });

        connection.on('error', (err) => {
            console.error('[Email Listener] Connection error:', err);
        });

        connection.on('close', () => {
            clearInterval(pollInterval);
            console.log('[Email Listener] Connection closed, reconnecting in 5s...');
            setTimeout(startEmailListener, 5000);
        });

    } catch (err) {
        console.error('[Email Listener] Failed to start:', err);
        setTimeout(startEmailListener, 5000);
    }
}

async function sendReply(invId, verdictData, senderEmail) {
    try {
        const dashboardLink = `http://localhost:5173/court/${invId}`;
        const reportLink = `http://localhost:5173/report/${invId}`;
        const recipient = senderEmail; 
        
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
            to: recipient,
            subject: `[Analyzed] Verdict: ${verdictData.verdict} - Case #${invId.substring(0,6)}`,
            html: htmlBody
        });

        console.log(`[Email Responder] Successfully sent reply for case ${invId} to ${recipient}`);
    } catch (err) {
        console.error(`[Email Responder] Error sending reply for case ${invId}:`, err);
    }
}

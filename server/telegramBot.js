import 'dotenv/config';
import nodemailer from 'nodemailer';

const TELEGRAM_TOKEN = '5218478950:AAGp7Cg2Kuh1nP0QLezlAAcNCerT9hB2cyI';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

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

async function sendDemoEmail(targetEmail = 'fakecreditcard88@gmail.com') {
    const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
            <h2>Inquest AI Investigation Complete</h2>
            <p>A new email submitted to the courtroom has been fully analyzed.</p>
            <ul>
                <li><strong>Verdict:</strong> PHISHING</li>
                <li><strong>Confidence:</strong> 100%</li>
                <li><strong>Risk Level:</strong> HIGH</li>
            </ul>
            <p><strong>Summary:</strong> This email is a classic credential harvesting phishing attack designed to impersonate PayPal. It uses a deceptive typosquatted domain and urgent threat language to trick the recipient into clicking a malicious verification link.</p>
            <p style="margin-top: 30px;">
              <a href="http://18.60.241.151/court/dea2b5cf-a48f-4324-aa98-4056dbcb9c15" style="padding: 10px 15px; background: #d4b872; color: #111; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">View Live Hearing Transcript</a>
              <a href="http://18.60.241.151/report/dea2b5cf-a48f-4324-aa98-4056dbcb9c15" style="padding: 10px 15px; background: transparent; border: 1px solid #d4b872; color: #d4b872; text-decoration: none; border-radius: 4px; display: inline-block;">Generate Official PDF Report</a>
            </p>
        </div>
    `;

    // Send the final Verdict email directly to the target email
    await smtpTransporter.sendMail({
        from: '"Inquest AI Courtroom" <' + process.env.EMAIL_USER + '>',
        to: targetEmail,
        subject: '[Analyzed] Verdict: PHISHING - Case #4869af',
        html: htmlBody
    });
    console.log(`Demo verdict email successfully sent to ${targetEmail}!`);
}

let lastUpdateId = 0;

async function pollTelegram() {
    try {
        const res = await fetch(`${TELEGRAM_API}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
        const data = await res.json();

        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                lastUpdateId = update.update_id;
                const message = update.message;

                if (message && message.text && message.text.startsWith('/demo')) {
                    const parts = message.text.split(' ');
                    const targetEmail = (parts.length > 1 && parts[1].includes('@')) ? parts[1] : 'fakecreditcard88@gmail.com';

                    console.log(`[Telegram] Received /demo command from ${message.from.first_name}`);

                    await fetch(`${TELEGRAM_API}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: message.chat.id,
                            text: `🚀 Sending instant Verdict report to ${targetEmail}...`
                        })
                    });

                    try {
                        await sendDemoEmail(targetEmail);
                        await fetch(`${TELEGRAM_API}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: message.chat.id,
                                text: `✅ Demo Verdict email successfully sent to ${targetEmail}! Check the inbox.`
                            })
                        });
                    } catch (err) {
                        console.error("Error sending demo email:", err);
                    }
                }
            }
        }
    } catch (e) {
        // Suppress fetch timeout errors
        if (!e.message.includes('fetch')) {
            console.error("Polling error:", e);
        }
    }

    // Poll continuously
    setTimeout(pollTelegram, 1000);
}

export function startTelegramBot() {
    console.log("🤖 InquestAI Demo Telegram Bot is running alongside backend...");
    pollTelegram();
}

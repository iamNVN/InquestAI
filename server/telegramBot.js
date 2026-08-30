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

async function sendDemoEmail() {
    const htmlBody = `
        <p>Dear Customer,</p>
        <p>We noticed unusual activity on your account. Please click the link below to verify your identity:</p>
        <p><a href="http://papyal-login.com/verify">http://papyal-login.com/verify</a></p>
        <p>Failure to do so will result in account suspension.</p>
        <p>Thanks,<br>The PayPal Security Team</p>
    `;

    // Send the email TO the system (courtroom@iamnvn.in) FROM a spoofed victim email
    await smtpTransporter.sendMail({
        from: '"Adi Shankar" <fakecreditcard88@gmail.com>', 
        to: process.env.EMAIL_USER, 
        subject: 'Fwd: Urgent: Verify Your Account',
        html: `---------- Forwarded message ---------<br>
From: PayPal Security &lt;security@papyal.com&gt;<br>
Date: Tue, Sep 1, 2026 at 9:00 AM<br>
Subject: Urgent: Verify Your Account<br>
To: Adi Shankar &lt;fakecreditcard88@gmail.com&gt;<br><br>
${htmlBody}`
    });
    console.log("Demo email successfully injected into the system!");
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
                
                if (message && message.text === '/demo') {
                    console.log(`[Telegram] Received /demo command from ${message.from.first_name}`);
                    
                    await fetch(`${TELEGRAM_API}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: message.chat.id,
                            text: '🚀 Injecting live phishing email into InquestAI now...'
                        })
                    });
                    
                    try {
                        await sendDemoEmail();
                        await fetch(`${TELEGRAM_API}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: message.chat.id,
                                text: `✅ Demo email sent to ${process.env.EMAIL_USER}! The AI courtroom is now in session. Check your dashboard.`
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

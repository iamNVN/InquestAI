import 'dotenv/config';
import nodemailer from 'nodemailer';

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

const htmlBody = `
    <p>Dear Customer,</p>
    <p>We noticed unusual activity on your account. Please click the link below to verify your identity:</p>
    <p><a href="http://papyal-login.com/verify">http://papyal-login.com/verify</a></p>
    <p>Failure to do so will result in account suspension.</p>
    <p>Thanks,<br>The PayPal Security Team</p>
`;

// Simulate a forwarded email by setting the From header to the forwarder,
// and putting the original email headers inside the body.
const rawEmailBody = `
---------- Forwarded message ---------
From: PayPal Security <security@papyal.com>
Date: Tue, Sep 1, 2026 at 9:00 AM
Subject: Urgent: Verify Your Account
To: Adi Shankar <fakecreditcard88@gmail.com>

${htmlBody}
`;

smtpTransporter.sendMail({
    from: '"PayPal Security" <security@papyal.com>',
    to: 'fakecreditcard88@gmail.com',
    subject: 'Fwd: Urgent: Verify Your Account',
    html: htmlBody
}).then(info => {
    console.log('Message sent: %s', info.messageId);
}).catch(err => {
    console.error('Error sending message:', err);
});

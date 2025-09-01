// backend/utils/emailTransporter.js
const nodemailer = require('nodemailer');

let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    tls: { rejectUnauthorized: true },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
  });

  transporter.verify((err, success) => {
    if (err) {
      console.warn("⚠️ Email transporter not ready:", err.message);
    } else {
      console.log("✅ Email transporter ready: Gmail SMTP connected");
    }
  });
} else {
  console.log("📧 Email disabled: EMAIL_USER or EMAIL_PASS not set");
}

module.exports = transporter;
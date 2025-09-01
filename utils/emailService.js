// backend/utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendResetEmail = async (email, token) => {
  const resetUrl = `https://shopme-frontend-zeta.vercel.app/reset-password/${token}`;

  await transporter.sendMail({
    from: `"ShopMe" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Reset Your Password',
    html: `
      <h2>Hello,</h2>
      <p>You requested a password reset. Click the link below to reset it.</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #000; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
        Reset Password
      </a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn’t request this, ignore this email.</p>
    `,
  });
};
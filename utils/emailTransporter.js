// backend/utils/emailTransporter.js
const { Resend } = require('resend');

// Check if API key is configured
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in environment variables');
  console.error('📧 Email functionality will be disabled');
}

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = {
  sendEmail: async (to, subject, html) => {
    try {
      // Check if API key is available
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY not configured');
      }

      console.log(`📧 Attempting to send email to: ${to}`);
      console.log(`📧 Subject: ${subject}`);
      
      const result = await resend.emails.send({
        from: 'onboarding@resend.dev', // ✅ Use this for now
        to,
        subject,
        html,
      });
      
      console.log('✅ Email sent successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      console.error('📧 Email details:', { to, subject });
      
      // Log specific Resend API errors
      if (error.name === 'ResendError') {
        console.error('🔑 Resend API Error:', error.message);
      }
      
      throw error; // Re-throw so calling code can handle it
    }
  }
};

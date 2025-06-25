require('dotenv').config();
const { sendEmail } = require('./services/emailService');

async function testEmailService() {
  console.log('Testing Email Service...');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Resend API Key:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
  console.log('Nodemailer Config:', 
    process.env.NODEMAILER_HOST && process.env.NODEMAILER_USER ? 'Set' : 'Not set'
  );

  const testEmail = {
    to: 'test@example.com',
    subject: 'Test Email from Oh Thanks',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Test Email</h2>
        <p>This is a test email to verify the email service is working correctly.</p>
        <p>If you receive this email, the email service is configured properly!</p>
        <p>Best regards,<br>The Oh Thanks Team</p>
      </div>
    `,
    text: 'This is a test email to verify the email service is working correctly.',
  };

  try {
    console.log('\nAttempting to send test email...');
    const result = await sendEmail(testEmail);
    console.log('✅ Email sent successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('configuration missing')) {
      console.log('\n💡 To fix this:');
      console.log('1. For production: Set RESEND_API_KEY environment variable');
      console.log('2. For development: Set NODEMAILER_HOST, NODEMAILER_USER, and NODEMAILER_PASS');
      console.log('3. Or set NODE_ENV=production and RESEND_API_KEY for Resend');
    }
  }
}

// Run the test
testEmailService().catch(console.error); 
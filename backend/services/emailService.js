const { Resend } = require('resend');
const nodemailer = require('nodemailer');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to create Nodemailer transporter (fallback)
const createNodemailerTransport = () => {
  if (!process.env.NODEMAILER_HOST || !process.env.NODEMAILER_USER || !process.env.NODEMAILER_PASS) {
    throw new Error('Nodemailer configuration missing');
  }

  return nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT || 587,
    secure: process.env.NODEMAILER_SECURE === 'true',
    requireTLS: process.env.NODEMAILER_REQUIRETLS === 'true',
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });
};

// Send email using Resend (production) or Nodemailer (fallback)
const sendEmail = async (options) => {
  const { to, subject, html, text, from } = options;
  
  // Use Resend in production, Nodemailer as fallback
  if (process.env.NODE_ENV === 'production' && process.env.RESEND_API_KEY) {
    try {
      const { data, error } = await resend.emails.send({
        from: from || process.env.RESEND_FROM_EMAIL || 'noreply@ohthanks.in',
        to: [to],
        subject,
        html,
        text,
      });

      if (error) {
        console.error('Resend email error:', error);
        throw new Error(`Resend email failed: ${error.message}`);
      }

      console.log(`Email sent via Resend to ${to}:`, data);
      return data;
    } catch (error) {
      console.error('Resend failed, falling back to Nodemailer:', error);
      // Fall back to Nodemailer if Resend fails
    }
  }

  // Use Nodemailer as fallback or for development
  try {
    const transporter = createNodemailerTransport();
    const mailOptions = {
      from: from || process.env.NODEMAILER_USER,
      to,
      subject,
      html,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent via Nodemailer to ${to}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Nodemailer email error:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${token}`;
  
  const emailOptions = {
    to: user.email,
    subject: 'Verify Your Email - Oh Thanks',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Oh Thanks!</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for registering with Oh Thanks. Please verify your email address to complete your registration.</p>
        <p>Click the button below to verify your email:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Verify Email</a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
        <p><strong>This link will expire in 24 hours.</strong></p>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The Oh Thanks Team</p>
      </div>
    `,
    text: `Click the link to verify your email: ${verificationUrl}`,
  };

  return await sendEmail(emailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${token}`;
  
  const emailOptions = {
    to: user.email,
    subject: 'Password Reset - Oh Thanks',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your Oh Thanks account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p><strong>This link will expire in 15 minutes.</strong></p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>The Oh Thanks Team</p>
      </div>
    `,
    text: `Click the link to reset your password: ${resetUrl}`,
  };

  return await sendEmail(emailOptions);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
}; 
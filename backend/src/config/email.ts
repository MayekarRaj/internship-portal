import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
// Defaults to Resend (recommended for production)
// For Resend: SMTP_USER should be "resend" and SMTP_PASS should be your API key (starts with re_)
export const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASS || '',
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Getfly Technologies',
    email: process.env.EMAIL_FROM || 'onboarding@resend.dev', // Resend default, should be your verified domain
  },
};

// Create transporter
export const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth.user ? emailConfig.auth : undefined,
});

// Verify email configuration
if (emailConfig.auth.user && emailConfig.auth.pass) {
  transporter.verify((error) => {
    if (error) {
      console.error('Email configuration error:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
}


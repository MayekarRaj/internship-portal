import { transporter, emailConfig } from '../config/email';
import { pool } from '../config/database';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  body: string;
  variables?: string[];
}

// Default email templates
export const defaultTemplates: Record<string, EmailTemplate> = {
  application_submitted: {
    name: 'Application Submitted',
    subject: 'Application Received - {{internship_title}}',
    body: `
      <h2>Thank you for your application!</h2>
      <p>Dear {{applicant_name}},</p>
      <p>We have successfully received your application for the <strong>{{internship_title}}</strong> position at Getfly Technologies.</p>
      <p>Your application is currently under review. We will get back to you within 5-7 business days.</p>
      <p><strong>Application Details:</strong></p>
      <ul>
        <li>Position: {{internship_title}}</li>
        <li>Department: {{department}}</li>
        <li>Application ID: #{{application_id}}</li>
      </ul>
      <p>If you have any questions, please feel free to contact us at contact@getflytechnologies.com</p>
      <p>Best regards,<br>Getfly Technologies Team</p>
    `,
    variables: ['applicant_name', 'internship_title', 'department', 'application_id'],
  },
  application_status_update: {
    name: 'Application Status Update',
    subject: 'Update on Your Application - {{internship_title}}',
    body: `
      <h2>Application Status Update</h2>
      <p>Dear {{applicant_name}},</p>
      <p>We wanted to update you on the status of your application for the <strong>{{internship_title}}</strong> position.</p>
      <p><strong>Current Status:</strong> {{status}}</p>
      {{#if message}}
      <p><strong>Message:</strong> {{message}}</p>
      {{/if}}
      <p>If you have any questions, please contact us at contact@getflytechnologies.com</p>
      <p>Best regards,<br>Getfly Technologies Team</p>
    `,
    variables: ['applicant_name', 'internship_title', 'status', 'message'],
  },
  new_application_notification: {
    name: 'New Application Notification (Admin)',
    subject: 'New Application Received - {{internship_title}}',
    body: `
      <h2>New Application Received</h2>
      <p>A new application has been submitted for the <strong>{{internship_title}}</strong> position.</p>
      <p><strong>Applicant Details:</strong></p>
      <ul>
        <li>Name: {{applicant_name}}</li>
        <li>Email: {{applicant_email}}</li>
        <li>University: {{university}}</li>
        <li>Major: {{major}}</li>
      </ul>
      <p>Please review the application in the admin panel.</p>
    `,
    variables: ['internship_title', 'applicant_name', 'applicant_email', 'university', 'major'],
  },
};

// Replace template variables
function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });
  // Remove conditional blocks if variables don't exist
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, content) => {
    return variables[varName] ? content : '';
  });
  return result;
}

// Send email
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('⚠️  Email not configured. Skipping email send.');
      console.warn('   Please set SMTP_USER and SMTP_PASS in your .env file');
      console.warn('   See .env.example for configuration instructions');
      return false;
    }

    const mailOptions = {
      from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log email
    await logEmail({
      to: options.to,
      subject: options.subject,
      status: 'sent',
      messageId: info.messageId,
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log failed email
    await logEmail({
      to: options.to,
      subject: options.subject,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return false;
  }
};

// Send email using template
export const sendTemplatedEmail = async (
  templateName: string,
  to: string | string[],
  variables: Record<string, string>
): Promise<boolean> => {
  const template = defaultTemplates[templateName];
  
  if (!template) {
    console.error(`Template ${templateName} not found`);
    return false;
  }

  const subject = replaceVariables(template.subject, variables);
  const body = replaceVariables(template.body, variables);

  // Handle multiple recipients
  const recipients = Array.isArray(to) ? to.join(', ') : to;

  return sendEmail({
    to: recipients,
    subject,
    html: body,
  });
};

// Log email to database
interface EmailLog {
  to: string;
  subject: string;
  status: 'sent' | 'failed';
  messageId?: string;
  error?: string;
}

const logEmail = async (log: EmailLog): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `INSERT INTO email_logs (recipient_email, subject, status, message_id, error_message, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [log.to, log.subject, log.status, log.messageId || null, log.error || null]
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error logging email:', error);
  }
};


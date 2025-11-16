# Email Service Setup Guide

The email service uses Nodemailer with SMTP configuration. Follow these steps to set up email functionality.

## Quick Setup Options

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Google account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Add to .env file:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   EMAIL_FROM_NAME=Getfly Technologies
   EMAIL_FROM=your-email@gmail.com
   ```

### Option 2: Mailtrap (Recommended for Testing)

Mailtrap is great for testing - it captures all emails without sending them.

1. **Sign up** at https://mailtrap.io (free tier available)

2. **Get SMTP credentials** from your inbox settings

3. **Add to .env file:**
   ```env
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_SECURE=false
   SMTP_USER=your-mailtrap-user
   SMTP_PASS=your-mailtrap-password
   EMAIL_FROM_NAME=Getfly Technologies
   EMAIL_FROM=noreply@getflytechnologies.com
   ```

### Option 3: SendGrid (Production)

1. **Sign up** at https://sendgrid.com (free tier: 100 emails/day)

2. **Create API Key**
   - Go to Settings > API Keys
   - Create new API key with "Mail Send" permissions

3. **Add to .env file:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   EMAIL_FROM_NAME=Getfly Technologies
   EMAIL_FROM=noreply@getflytechnologies.com
   ```

### Option 4: AWS SES (Production)

1. **Set up AWS SES** in your AWS account
2. **Verify your email** or domain
3. **Create SMTP credentials**

4. **Add to .env file:**
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-ses-access-key
   SMTP_PASS=your-ses-secret-key
   EMAIL_FROM_NAME=Getfly Technologies
   EMAIL_FROM=verified-email@yourdomain.com
   ```

## Environment Variables

Create a `.env` file in the `backend` directory with these variables:

```env
# Required for email to work
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password-or-app-password

# Optional
EMAIL_FROM_NAME=Getfly Technologies
EMAIL_FROM=noreply@getflytechnologies.com
```

## Testing Email Configuration

After setting up your `.env` file:

1. **Restart your backend server**
   ```bash
   npm run dev
   ```

2. **Check the console** - you should see:
   ```
   Email server is ready to send messages
   ```

3. **Test by submitting an application** - the applicant should receive a confirmation email

## Troubleshooting

### "Email not configured" warning
- Make sure `.env` file exists in the `backend` directory
- Check that `SMTP_USER` and `SMTP_PASS` are set
- Restart the server after changing `.env`

### Gmail: "Less secure app access"
- Gmail no longer supports "less secure apps"
- You MUST use an App Password (see Option 1 above)
- Regular Gmail password will NOT work

### Connection timeout
- Check your firewall settings
- Verify SMTP port (587 for TLS, 465 for SSL)
- Try different SMTP host/port combination

### Authentication failed
- Double-check your username and password
- For Gmail: Make sure you're using App Password, not regular password
- For SendGrid: Make sure SMTP_USER is "apikey" and SMTP_PASS is your API key

## Email Templates

The system includes these email templates:
- **application_submitted**: Sent to applicant when they submit an application
- **application_status_update**: Sent to applicant when status changes
- **new_application_notification**: Sent to admins when new application is received

Templates are defined in `backend/src/services/emailService.ts` and can be customized.

## Email Logs

All emails are logged in the `email_logs` table in the database, including:
- Recipient email
- Subject
- Status (sent/failed)
- Error messages (if failed)
- Timestamp


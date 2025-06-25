# Email Service Setup

This application uses a hybrid email service that automatically switches between Resend (production) and Nodemailer (development/fallback) based on the environment.

## Production Setup (Resend)

For production, the application uses [Resend](https://resend.com) for reliable transaction emails.

### Environment Variables Required:

```env
# Resend Configuration (Production)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
NODE_ENV=production

# Client URL for email links
CLIENT_URL=https://yourdomain.com
```

### Steps to set up Resend:

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add your domain to Resend (optional but recommended)
4. Set the environment variables above

## Development Setup (Nodemailer)

For development, the application falls back to Nodemailer using your existing SMTP configuration.

### Environment Variables Required:

```env
# Nodemailer Configuration (Development)
NODEMAILER_HOST=your_smtp_host
NODEMAILER_USER=your_smtp_username
NODEMAILER_PASS=your_smtp_password
NODEMAILER_PORT=587
NODEMAILER_SECURE=false
NODEMAILER_REQUIRETLS=true

# Client URL for email links
CLIENT_URL=http://localhost:3000
```

## How It Works

1. **Production Mode**: When `NODE_ENV=production` and `RESEND_API_KEY` is set, the application uses Resend
2. **Development Mode**: When in development or if Resend fails, it falls back to Nodemailer
3. **Error Handling**: If both services fail, appropriate error messages are returned

## Email Templates

The following email templates are available:

- **Email Verification**: Sent when users register or request email verification
- **Password Reset**: Sent when users request password reset

## Testing

To test the email service:

1. **Development**: Use your existing Nodemailer setup
2. **Production**: Use Resend's test mode or sandbox domain
3. **No Email**: If no email configuration is provided, users are auto-verified in development

## Troubleshooting

### Resend Issues:
- Check your API key is correct
- Verify your domain is properly configured in Resend
- Check Resend dashboard for delivery status

### Nodemailer Issues:
- Verify SMTP credentials
- Check firewall/network settings
- Test SMTP connection manually

### General Issues:
- Check environment variables are set correctly
- Verify `CLIENT_URL` is accessible
- Check server logs for detailed error messages 
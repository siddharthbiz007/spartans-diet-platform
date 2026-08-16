import nodemailer from 'nodemailer';

// Configure transporter from environment variables
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  // Fallback: If user has provided GMAIL_USER & GMAIL_APP_PASS
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
      }
    });
  }

  return null;
}

/**
 * Send OTP verification email to user
 * @param {string} toEmail - Recipient email address
 * @param {string} otpCode - 6 digit numeric code
 * @param {string} purpose - 'signup' | 'login' | 'reset_password'
 */
export async function sendOtpEmail(toEmail, otpCode, purpose = 'signup') {
  const transporter = createTransporter();
  const fromName = process.env.SMTP_FROM_NAME || 'AYUVA - Smart Ayurvedic Platform';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@spartans.com';

  const purposeLabels = {
    signup: 'Email Verification for Registration',
    login: 'One-Time Sign In Verification',
    reset_password: 'Password Reset Request'
  };

  const subject = `[${otpCode}] ${purposeLabels[purpose] || 'Your AYUVA Verification Code'}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f4; margin: 0; padding: 20px; color: #1e3a29; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e0e8e2; }
        .header { background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; letter-spacing: 1px; font-weight: 700; }
        .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; margin-bottom: 18px; color: #2d3748; }
        .otp-box { background: #e8f5e9; border: 2px dashed #40916c; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1b4332; font-family: monospace; }
        .otp-expiry { font-size: 13px; color: #52796f; margin-top: 8px; }
        .info-text { font-size: 14px; line-height: 1.6; color: #4a5568; margin: 16px 0; }
        .footer { background: #f8faf9; border-top: 1px solid #e0e8e2; padding: 20px; text-align: center; font-size: 12px; color: #718096; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌿 AYUVA</h1>
          <p>Smart Ayurvedic Diet Management Platform</p>
        </div>
        <div class="content">
          <div class="greeting">Hello,</div>
          <p class="info-text">
            Use the following 6-digit One-Time Password (OTP) to complete your <strong>${purposeLabels[purpose] || 'verification'}</strong> on AYUVA.
          </p>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
            <div class="otp-expiry">⏱️ Valid for 10 minutes only</div>
          </div>
          <p class="info-text">
            If you did not request this verification code, please ignore this email or contact support. Never share this OTP with anyone.
          </p>
        </div>
        <div class="footer">
          <p>© 2026 Spartans Ayurvedic Platform • Holistic Wellness & Dietetics</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject,
        html: htmlContent
      });
      console.log(`[Email Service] OTP email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error('[Email Service] SMTP send failed:', err.message);
      // Still log the OTP in console for developer/demo access
      console.log(`\n======================================================`);
      console.log(`[DEMO/DEV OTP] Recipient: ${toEmail} | CODE: ${otpCode} | Purpose: ${purpose}`);
      console.log(`======================================================\n`);
      return { success: true, mode: 'dev_fallback', devCode: otpCode, error: err.message };
    }
  } else {
    // If SMTP not configured, log clearly in console
    console.log(`\n======================================================`);
    console.log(`[LOCAL DEV MODE] No SMTP configured in .env.`);
    console.log(`[OTP CODE GENERATED FOR ${toEmail}]: ${otpCode} (Purpose: ${purpose})`);
    console.log(`======================================================\n`);
    return { success: true, mode: 'local_dev', devCode: otpCode };
  }
}

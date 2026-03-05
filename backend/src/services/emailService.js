const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendOTPEmail = async ({ to, name, otp, purpose }) => {
  const subject = purpose === 'login'
    ? 'Your Login Verification Code'
    : 'Verify Your Account – OTP';

  const action = purpose === 'login' ? 'log in' : 'verify your account';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
          .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px; }
          .body { padding: 36px 40px; }
          .greeting { font-size: 16px; color: #1e293b; margin: 0 0 16px; }
          .message { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 28px; }
          .otp-box { background: #f8faff; border: 2px dashed #c7d2fe; border-radius: 10px; padding: 20px; text-align: center; margin: 0 0 28px; }
          .otp-code { font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #6366f1; font-family: monospace; }
          .otp-note { font-size: 12px; color: #94a3b8; margin: 8px 0 0; }
          .warning { background: #fff7ed; border-left: 3px solid #f97316; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #9a3412; margin: 0 0 24px; }
          .footer { background: #f8fafc; padding: 20px 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Verification Code</h1>
            <p>Secure your account</p>
          </div>
          <div class="body">
            <p class="greeting">Hi ${name},</p>
            <p class="message">Use the code below to ${action}. This code is valid for <strong>${process.env.OTP_EXPIRES_MINUTES || 10} minutes</strong>.</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p class="otp-note">Enter this code to continue</p>
            </div>
            <div class="warning">⚠️ Never share this code with anyone. We will never ask for it.</div>
            <p class="message" style="margin:0">If you didn't request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">This email was sent automatically. Please do not reply.</div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"App Security" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendOTPEmail };
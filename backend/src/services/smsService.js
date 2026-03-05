const twilio = require('twilio');

const getClient = () => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured');
  }
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
};

const sendOTPSMS = async ({ to, otp, purpose }) => {
  const client = getClient();
  const action = purpose === 'login' ? 'login' : 'verify your account';
  const expires = process.env.OTP_EXPIRES_MINUTES || 10;

  await client.messages.create({
    body: `Your verification code is: ${otp}\nUse it to ${action}. Valid for ${expires} minutes.\nNever share this code.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
};

module.exports = { sendOTPSMS };
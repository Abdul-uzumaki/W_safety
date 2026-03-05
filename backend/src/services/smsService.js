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

  // Twilio requires E.164 format. 
  // If the number is 10 digits, we assume it's an Indian number (+91)
  let formattedTo = to.toString().replace(/\D/g, '');
  if (formattedTo.length === 10) {
    formattedTo = `+91${formattedTo}`;
  } else if (!formattedTo.startsWith('+')) {
    formattedTo = `+${formattedTo}`;
  }

  await client.messages.create({
    body: `Your verification code is: ${otp}\nUse it to ${action}. Valid for ${expires} minutes.\nNever share this code.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formattedTo,
  });
};

const sendGuardianAlert = async ({ to, victimName, guardianName }) => {
  const client = getClient();

  let formattedTo = to.toString().replace(/\D/g, '');
  if (formattedTo.length === 10) {
    formattedTo = `+91${formattedTo}`;
  } else if (!formattedTo.startsWith('+')) {
    formattedTo = `+${formattedTo}`;
  }

  await client.messages.create({
    body: `🌸 SafeHer EMERGENCY: Hi ${guardianName}, your contact ${victimName} is feeling extremely distressed and may need support. Please check on them immediately.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formattedTo,
  });
};

module.exports = { sendOTPSMS, sendGuardianAlert };
const crypto = require('crypto');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('./emailService');
const { sendOTPSMS } = require('./smsService');

const generateCode = () =>
  crypto.randomInt(100000, 999999).toString();

const createAndSendOTP = async ({ userId, email, phone, name, purpose }) => {
  // Invalidate any existing unused OTPs for this user + purpose
  await OTP.deleteMany({ userId, purpose, used: false });

  const code = generateCode();
  const expiresAt = new Date(
    Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES) || 10) * 60 * 1000
  );

  await OTP.create({ userId, email, phone, code, purpose, expiresAt });

  const results = { sms: false };

  // Send SMS (Primary channel now)
  try {
    await sendOTPSMS({ to: phone, otp: code, purpose });
    results.sms = true;
  } catch (err) {
    console.error('[OTP] SMS send failed:', err.message);
  }

  if (!results.sms) {
    if (process.env.NODE_ENV === 'development') {
      console.log('--------------------------------------------------');
      console.log(`[DEV ONLY] OTP SMS Delivery failed, but your code is: ${code}`);
      console.log('--------------------------------------------------');
      return results;
    }
    throw new Error('Failed to deliver OTP via SMS');
  }

  return results;
};

const verifyOTP = async ({ userId, code, purpose }) => {
  const otp = await OTP.findOne({ userId, purpose, used: false })
    .sort({ createdAt: -1 });

  if (!otp) return { valid: false, reason: 'No OTP found. Please request a new one.' };
  if (otp.isExpired()) return { valid: false, reason: 'OTP has expired. Please request a new one.' };

  // Increment attempts
  otp.attempts += 1;
  if (otp.attempts > 5) {
    await otp.save();
    return { valid: false, reason: 'Too many attempts. Please request a new OTP.' };
  }

  if (otp.code !== code) {
    await otp.save();
    return { valid: false, reason: 'Incorrect OTP.' };
  }

  otp.used = true;
  await otp.save();
  return { valid: true };
};

module.exports = { createAndSendOTP, verifyOTP };
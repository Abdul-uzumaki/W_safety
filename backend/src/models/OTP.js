const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  phone: { type: String, default: null },
  code: { type: String, required: true },
  purpose: { type: String, enum: ['register', 'login'], default: 'register' },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.methods.isExpired = function () {
  return Date.now() > this.expiresAt.getTime();
};

module.exports = mongoose.model('OTP', otpSchema);
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { createAndSendOTP, verifyOTP } = require('../services/otpService');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const logActivity = async (userId, type, meta = {}) => {
  try {
    await Activity.create({ userId, type, ...meta });
  } catch (e) {
    console.error('[Activity] Log failed:', e.message);
  }
};

// POST /api/auth/register — Step 1: create unverified user, send OTP
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    let user = existing;
    if (!user) {
      user = new User({ name, email, phone: phone || null, password });
    } else {
      user.name = name;
      user.phone = phone || null;
      user.password = password;
      user.isVerified = false;
    }
    await user.save();

    const channels = await createAndSendOTP({ userId: user._id, email: user.email, phone: user.phone, name: user.name, purpose: 'register' });

    res.status(201).json({ success: true, message: `OTP sent to your email${user.phone ? ' and phone' : ''}`, userId: user._id, channels });
  } catch (error) { next(error); }
};

// POST /api/auth/verify-register — Step 2: verify OTP, issue token
const verifyRegister = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ success: false, message: 'userId and otp are required' });

    const result = await verifyOTP({ userId, code: otp.toString(), purpose: 'register' });
    if (!result.valid) return res.status(400).json({ success: false, message: result.reason });

    const user = await User.findByIdAndUpdate(userId, { isVerified: true, lastLogin: new Date() }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await logActivity(user._id, 'login', { ip: req.ip, userAgent: req.headers['user-agent'] });
    const token = generateToken(user._id);

    res.json({ success: true, message: 'Account verified', token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone } });
  } catch (error) { next(error); }
};

// POST /api/auth/login — Step 1: verify credentials, send OTP
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isVerified)
      return res.status(403).json({ success: false, message: 'Account not verified', userId: user._id, requiresVerification: true });

    const channels = await createAndSendOTP({ userId: user._id, email: user.email, phone: user.phone, name: user.name, purpose: 'login' });

    res.json({ success: true, message: `OTP sent to your email${user.phone ? ' and phone' : ''}`, userId: user._id, channels });
  } catch (error) { next(error); }
};

// POST /api/auth/verify-login — Step 2: verify OTP, issue token
const verifyLogin = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ success: false, message: 'userId and otp are required' });

    const result = await verifyOTP({ userId, code: otp.toString(), purpose: 'login' });
    if (!result.valid) return res.status(400).json({ success: false, message: result.reason });

    const user = await User.findByIdAndUpdate(userId, { lastLogin: new Date() }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await logActivity(user._id, 'login', { ip: req.ip, userAgent: req.headers['user-agent'] });
    const token = generateToken(user._id);

    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone } });
  } catch (error) { next(error); }
};

// POST /api/auth/resend-otp
const resendOTP = async (req, res, next) => {
  try {
    const { userId, purpose } = req.body;
    if (!userId || !purpose) return res.status(400).json({ success: false, message: 'userId and purpose are required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const channels = await createAndSendOTP({ userId: user._id, email: user.email, phone: user.phone, name: user.name, purpose });
    res.json({ success: true, message: 'OTP resent', channels });
  } catch (error) { next(error); }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    if (req.user) await logActivity(req.user._id, 'logout', { ip: req.ip, userAgent: req.headers['user-agent'] });
    res.json({ success: true, message: 'Logged out' });
  } catch (error) { next(error); }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: { id: req.user._id, name: req.user.name, email: req.user.email, phone: req.user.phone } });
};

// POST /api/auth/passwordless
const passwordlessAuth = async (req, res, next) => {
  try {
    const { phone, name, email, guardianName, guardianPhone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });

    let user = await User.findOne({ phone });
    if (!user) {
      if (!name) return res.status(400).json({ success: false, message: 'Name is required for new users' });
      user = new User({
        name,
        phone,
        email: email || null,
        guardianName: guardianName || null,
        guardianPhone: guardianPhone || null
      });
    } else {
      if (name) user.name = name;
      if (email) user.email = email;
      if (guardianName) user.guardianName = guardianName;
      if (guardianPhone) user.guardianPhone = guardianPhone;
    }
    await user.save();

    const channels = await createAndSendOTP({ userId: user._id, email: user.email, phone: user.phone, name: user.name, purpose: 'login' });

    res.json({ success: true, message: `OTP sent to your phone`, userId: user._id, channels });
  } catch (error) { next(error); }
};

// POST /api/auth/verify-passwordless
const verifyPasswordlessAuth = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'phone and otp are required' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const result = await verifyOTP({ userId: user._id, code: otp.toString(), purpose: 'login' });
    if (!result.valid) return res.status(400).json({ success: false, message: result.reason });

    user.isVerified = true;
    user.lastLogin = new Date();
    await user.save();

    await logActivity(user._id, 'login', { ip: req.ip, userAgent: req.headers['user-agent'] });
    const token = generateToken(user._id);

    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone } });
  } catch (error) { next(error); }
};

module.exports = { register, verifyRegister, login, verifyLogin, resendOTP, logout, getMe, passwordlessAuth, verifyPasswordlessAuth };
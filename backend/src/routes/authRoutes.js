const express = require('express');
const router = express.Router();
const { register, verifyRegister, login, verifyLogin, resendOTP, logout, getMe, passwordlessAuth, verifyPasswordlessAuth } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-register', verifyRegister);
router.post('/login', login);
router.post('/verify-login', verifyLogin);
router.post('/resend-otp', resendOTP);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

router.post('/passwordless', passwordlessAuth);
router.post('/verify-passwordless', verifyPasswordlessAuth);

module.exports = router;
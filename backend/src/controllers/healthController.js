const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { getPrediction } = require('../services/mlService');
const { sendGuardianAlert } = require('../services/smsService');

// POST /api/health/notify-guardian
const notifyGuardian = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.guardianPhone) {
      return res.status(400).json({ success: false, message: 'No guardian contact configured. Please go to your profile and add a guardian phone number.' });
    }

    // Attempt to send SMS
    try {
      await sendGuardianAlert({
        to: user.guardianPhone,
        victimName: user.name,
        guardianName: user.guardianName || 'Guardian'
      });
      res.json({ success: true, message: 'Guardian notified successfully' });
    } catch (err) {
      console.error('[Emergency] Guardian notification failed:', err.message);

      // Dev fallback: log to console
      if (process.env.NODE_ENV === 'development') {
        process.stdout.write('\n--------------------------------------------------\n');
        process.stdout.write(`[DEV ONLY] EMERGENCY ALERT for ${user.name} sent to ${user.guardianPhone}\n`);
        process.stdout.write('--------------------------------------------------\n\n');
        return res.json({ success: true, message: 'Guardian notified (dev mode)' });
      }

      res.status(500).json({ success: false, message: 'Failed to notify guardian via SMS. Please contact them manually if possible.' });
    }
  } catch (error) {
    next(error);
  }
};

const submitHealthData = async (req, res, next) => {
  try {
    const {
      heartRate, age, bmi, height, weight,
      bpSystolic, bpDiastolic, temperature,
      sleepHours, activityLevel, mood,
    } = req.body;

    if (!heartRate || !age || !bmi || !height || !weight ||
      !bpSystolic || !bpDiastolic || !temperature ||
      !sleepHours || !activityLevel || !mood) {
      return res.status(400).json({ success: false, message: 'All health fields are required' });
    }

    const { score, riskLevel } = await getPrediction({
      heartRate, age, bmi, height, weight,
      bpSystolic, bpDiastolic, temperature,
      sleepHours, activityLevel, mood,
    });

    const record = await HealthRecord.create({
      user: req.user._id,
      heartRate, age, bmi, height, weight,
      bpSystolic, bpDiastolic, temperature,
      sleepHours, activityLevel, mood,
      healthScore: score,
      riskLevel,
    });

    // Log activity
    await Activity.create({
      userId: req.user._id,
      type: 'health_submission',
      healthData: { heartRate, age, bmi, bpSystolic, bpDiastolic, temperature, sleepHours, activityLevel, mood },
      healthScore: score,
    }).catch(() => { });

    res.status(201).json({
      success: true,
      data: { id: record._id, healthScore: score, riskLevel, createdAt: record.createdAt },
    });
  } catch (error) {
    next(error);
  }
};

const getHealthHistory = async (req, res, next) => {
  try {
    const records = await HealthRecord.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitHealthData, getHealthHistory, notifyGuardian };
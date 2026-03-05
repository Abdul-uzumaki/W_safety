const HealthRecord = require('../models/HealthRecord');
const Activity = require('../models/Activity');
const { getPrediction } = require('../services/mlService');

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
    }).catch(() => {});

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

module.exports = { submitHealthData, getHealthHistory };
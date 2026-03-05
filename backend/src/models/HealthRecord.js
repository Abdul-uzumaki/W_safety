const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema(
  {
    user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    heartRate:     { type: Number, required: true },
    age:           { type: Number, required: true },
    bmi:           { type: Number, required: true },
    height:        { type: Number, required: true },
    weight:        { type: Number, required: true },
    bpSystolic:    { type: Number, required: true },
    bpDiastolic:   { type: Number, required: true },
    temperature:   { type: Number, required: true },
    sleepHours:    { type: Number, required: true },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      required: true,
    },
    mood:          { type: Number, min: 1, max: 5, required: true },
    healthScore:   { type: Number, default: null },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      default: 'low',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
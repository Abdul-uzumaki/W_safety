const axios = require('axios');

const getPrediction = async (healthData) => {
  try {
    const response = await axios.post(
      process.env.ML_API_URL || 'http://localhost:5000/predict',
      healthData,
      { timeout: 5000 }
    );
    return response.data;
  } catch {
    return simulatePrediction(healthData);
  }
};

/**
 * Local simulation matching the model's feature logic.
 * Inputs: heart_rate, age, bmi, height, weight,
 *         bp_systolic, bp_diastolic, temperature,
 *         sleep_hours, activity_level, mood
 */
const simulatePrediction = ({
  heartRate, age, bmi,
  bpSystolic, bpDiastolic,
  temperature, sleepHours,
  activityLevel, mood,
}) => {
  let score = 100;

  // Heart Rate (normal 60–100 bpm)
  if (heartRate < 50 || heartRate > 120)     score -= 20;
  else if (heartRate < 60 || heartRate > 100) score -= 10;

  // Age risk
  if (age >= 70)       score -= 15;
  else if (age >= 55)  score -= 8;
  else if (age >= 40)  score -= 3;

  // BMI (normal 18.5–24.9)
  if (bmi < 16 || bmi >= 35)        score -= 20;
  else if (bmi < 18.5 || bmi >= 30) score -= 12;
  else if (bmi >= 25)               score -= 5;

  // BP Systolic (normal < 120)
  if (bpSystolic >= 180)      score -= 25;
  else if (bpSystolic >= 140) score -= 18;
  else if (bpSystolic >= 130) score -= 10;
  else if (bpSystolic >= 120) score -= 4;

  // BP Diastolic (normal < 80)
  if (bpDiastolic >= 120)     score -= 20;
  else if (bpDiastolic >= 90) score -= 14;
  else if (bpDiastolic >= 80) score -= 6;

  // Temperature (normal 36.1–37.2 °C)
  if (temperature < 35 || temperature > 40)        score -= 20;
  else if (temperature < 36.1 || temperature > 38) score -= 10;
  else if (temperature > 37.2)                     score -= 4;

  // Sleep Hours (optimal 7–9)
  if (sleepHours < 4)       score -= 18;
  else if (sleepHours < 6)  score -= 10;
  else if (sleepHours < 7)  score -= 4;
  else if (sleepHours > 10) score -= 6;

  // Activity Level
  const activityBonus = {
    sedentary:   -15,
    light:       -5,
    moderate:     0,
    active:       5,
    very_active:  3,   // slight deduction for overtraining risk
  };
  score += (activityBonus[activityLevel] ?? -10);

  // Mood (1–5)
  if (mood <= 1)       score -= 12;
  else if (mood === 2) score -= 6;
  else if (mood >= 4)  score += 3;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let riskLevel;
  if (score >= 80)      riskLevel = 'low';
  else if (score >= 60) riskLevel = 'moderate';
  else if (score >= 40) riskLevel = 'high';
  else                  riskLevel = 'critical';

  return { score, riskLevel };
};

module.exports = { getPrediction };
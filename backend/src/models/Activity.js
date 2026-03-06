const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['login', 'logout', 'page_visit', 'health_submission', 'chat_message'],
    required: true,
  },
  // Page visit
  page: { type: String, default: null },
  // Health submission snapshot
  healthData: { type: mongoose.Schema.Types.Mixed, default: null },
  healthScore: { type: Number, default: null },
  // Chat message snapshot
  messagePreview: { type: String, default: null }, // first 100 chars
  // Meta
  ip: { type: String, default: null },
  userAgent: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1 });

module.exports = mongoose.model('Activity', activitySchema);
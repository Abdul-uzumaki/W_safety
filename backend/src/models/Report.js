const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String },
    location: { type: String, required: true },
    incidentType: [{ type: String }],
    description: { type: String, required: true },
    referenceId: { type: String, unique: true },
    status: { type: String, default: 'Submitted' },
    createdAt: { type: Date, default: Date.now },
});

// Generate reference ID before saving
reportSchema.pre('save', function (next) {
    if (!this.referenceId) {
        this.referenceId = 'SH-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Report', reportSchema);

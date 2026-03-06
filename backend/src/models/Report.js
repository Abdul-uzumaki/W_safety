const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String },
    location: { type: String, required: true },
    incidentType: [{ type: String }],
    description: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referenceId: { type: String, unique: true }
}, { timestamps: true });

// Generate a random reference ID if not provided
reportSchema.pre('save', function (next) {
    if (!this.referenceId) {
        this.referenceId = 'REP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Report', reportSchema);

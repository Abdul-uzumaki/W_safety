const Report = require('../models/Report');

// POST /api/report
const submitReport = async (req, res, next) => {
    try {
        const { fullName, date, time, location, incidentType, description } = req.body;
        if (!fullName || !date || !location || !description)
            return res.status(400).json({ success: false, message: 'Required fields missing' });

        const report = new Report({ fullName, date, time, location, incidentType, description });
        await report.save();

        res.status(201).json({
            success: true,
            referenceId: report.referenceId,
            message: 'Report submitted successfully',
        });
    } catch (error) { next(error); }
};

// GET /api/report/my
const getMyReports = async (req, res, next) => {
    try {
        // If we want to filter by user, we'll need reports linked to users.
        // For now, let's just use email if provided.
        const reports = await Report.find({ fullName: req.user.name });
        res.json({ success: true, reports });
    } catch (error) { next(error); }
};

module.exports = { submitReport, getMyReports };

const Activity = require('../models/Activity');

// POST /api/activity/page-visit
const logPageVisit = async (req, res, next) => {
  try {
    const { page } = req.body;
    if (!page) return res.status(400).json({ success: false, message: 'page is required' });

    await Activity.create({
      userId: req.user._id,
      type: 'page_visit',
      page,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true });
  } catch (error) { next(error); }
};

// GET /api/activity — get current user's activity history
const getMyActivity = async (req, res, next) => {
  try {
    const { limit = 50, page = 1, type } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.type = type;

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Activity.countDocuments(filter);

    res.json({ success: true, activities, total, page: parseInt(page) });
  } catch (error) { next(error); }
};

// GET /api/activity/stats — summary counts per type
const getActivityStats = async (req, res, next) => {
  try {
    const stats = await Activity.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$type', count: { $sum: 1 }, last: { $max: '$createdAt' } } },
    ]);
    res.json({ success: true, stats });
  } catch (error) { next(error); }
};

module.exports = { logPageVisit, getMyActivity, getActivityStats };
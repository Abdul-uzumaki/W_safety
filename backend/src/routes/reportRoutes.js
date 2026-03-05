const express = require('express');
const router = express.Router();
const { submitReport, getMyReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// Post report (can be anonymous or logged in)
router.post('/', submitReport);

// Get my reports (requires auth)
router.get('/my', protect, getMyReports);

module.exports = router;

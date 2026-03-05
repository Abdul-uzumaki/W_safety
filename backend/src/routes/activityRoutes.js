const express = require('express');
const router = express.Router();
const { logPageVisit, getMyActivity, getActivityStats } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/page-visit', logPageVisit);
router.get('/', getMyActivity);
router.get('/stats', getActivityStats);

module.exports = router;
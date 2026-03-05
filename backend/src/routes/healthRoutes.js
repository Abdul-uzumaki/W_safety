const express = require('express');
const { submitHealthData, getHealthHistory, notifyGuardian } = require('../controllers/healthController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', submitHealthData);
router.get('/history', getHealthHistory);
router.post('/notify-guardian', notifyGuardian);

module.exports = router;
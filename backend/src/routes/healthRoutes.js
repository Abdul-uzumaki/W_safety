const express = require('express');
const { submitHealthData, getHealthHistory } = require('../controllers/healthController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', submitHealthData);
router.get('/history', getHealthHistory);

module.exports = router;
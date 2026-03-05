const express = require('express');
const router = express.Router();
const { createReport, getReportPDF } = require('../controllers/reportController');

// POST /api/report
router.post('/', createReport);

// GET /api/report/:id/pdf
router.get('/:id/pdf', getReportPDF);

module.exports = router;

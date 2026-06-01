const express = require('express');
const { parseInvoiceFromText, generateReminderEmail, getDashboardSummary } = require('../controllers/aiController.js');
const { protect } = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.post('/parse-invoice', protect, parseInvoiceFromText);
router.post('/generate-reminder', protect, generateReminderEmail);
router.get('/dashboard-summary', protect, getDashboardSummary);

module.exports = router;
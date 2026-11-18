const express = require('express');
const router = express.Router();
const {
  simulatePayment,
  getPaymentByApplication,
  getAllPayments,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/simulate', authorize('student'), simulatePayment);
router.get('/application/:applicationId', getPaymentByApplication);
router.get('/', authorize('admin'), getAllPayments);

module.exports = router;

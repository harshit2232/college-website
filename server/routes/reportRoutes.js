const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  exportApplicationsCSV,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', authorize('admin', 'faculty'), getDashboardAnalytics);
router.get('/export-csv', authorize('admin'), exportApplicationsCSV);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getMyApplications,
  getApplicationById,
  createApplication,
  updateApplicationStep,
  submitApplication,
  getAllApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Student routes
router.get('/my-applications', authorize('student'), getMyApplications);
router.post('/', authorize('student'), createApplication);
router.put('/:id/step', authorize('student'), updateApplicationStep);
router.post('/:id/submit', authorize('student'), submitApplication);

// Faculty & Admin routes
router.get('/', authorize('faculty', 'admin'), getAllApplications);
router.put('/:id/status', authorize('faculty', 'admin'), updateApplicationStatus);

// Shared route (accessible by student owner or faculty/admin)
router.get('/:id', getApplicationById);

module.exports = router;

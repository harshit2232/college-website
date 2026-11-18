const express = require('express');
const router = express.Router();
const {
  getEvaluationQueue,
  submitEvaluation,
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('faculty', 'admin'));

router.get('/queue', getEvaluationQueue);
router.post('/evaluate/:id', submitEvaluation);

module.exports = router;

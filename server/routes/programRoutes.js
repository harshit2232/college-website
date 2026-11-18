const express = require('express');
const router = express.Router();
const {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
} = require('../controllers/programController');
const { protect, authorize } = require('../middleware/auth');

// Optional protect middleware so public can view programs, but admin can see drafts/all
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization || (req.cookies && req.cookies.token)) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getPrograms);
router.get('/:id', optionalAuth, getProgramById);
router.post('/', protect, authorize('admin'), createProgram);
router.put('/:id', protect, authorize('admin'), updateProgram);
router.delete('/:id', protect, authorize('admin'), deleteProgram);

module.exports = router;

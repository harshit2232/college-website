const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getApplicationDocuments,
  getMyDocuments,
  verifyDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/upload', authorize('student', 'admin'), upload.single('file'), uploadDocument);
router.get('/my-documents', authorize('student'), getMyDocuments);
router.get('/application/:applicationId', getApplicationDocuments);
router.put('/:id/verify', authorize('faculty', 'admin'), verifyDocument);
router.delete('/:id', deleteDocument);

module.exports = router;

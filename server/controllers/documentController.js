const Document = require('../models/Document');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private (Student)
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a valid file.',
      });
    }

    const { applicationId, documentType, title } = req.body;

    const fileUrl = `/uploads/${req.file.filename}`;

    const document = await Document.create({
      application: applicationId || null,
      student: req.user.id,
      documentType: documentType || 'other',
      title: title || req.file.originalname,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'pending',
    });

    // If linked to an application, push into application.documents
    if (applicationId) {
      await Application.findByIdAndUpdate(applicationId, {
        $addToSet: { documents: document._id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all documents for a specific application
// @route   GET /api/documents/application/:applicationId
// @access  Private
exports.getApplicationDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({
      application: req.params.applicationId,
    }).populate('verifiedBy', 'name email');

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all documents of logged-in student
// @route   GET /api/documents/my-documents
// @access  Private (Student)
exports.getMyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ student: req.user.id })
      .populate('application', 'applicationNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify or reject a document (Faculty / Admin)
// @route   PUT /api/documents/:id/verify
// @access  Private (Faculty, Admin)
exports.verifyDocument = async (req, res, next) => {
  try {
    const { status, verificationNotes } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be verified, rejected, or pending.',
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
    }

    document.status = status;
    document.verificationNotes = verificationNotes || '';
    document.verifiedBy = req.user.id;
    document.verifiedAt = new Date();

    await document.save();

    // Trigger notification to student
    await Notification.create({
      recipient: document.student,
      sender: req.user.id,
      title: `Document ${status === 'verified' ? 'Verified ✅' : 'Rejected ⚠️'}: ${document.title}`,
      message: `Your document '${document.title}' was reviewed. Result: ${status.toUpperCase()}. ${verificationNotes ? `Feedback: ${verificationNotes}` : ''}`,
      type: 'document_action',
      relatedApplication: document.application,
      link: document.application
        ? `/student/applications/${document.application}`
        : '/student/documents',
    });

    res.status(200).json({
      success: true,
      message: `Document has been marked as ${status}.`,
      document,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private (Student or Admin)
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
    }

    // Role check
    if (
      req.user.role === 'student' &&
      document.student.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this document.',
      });
    }

    // Attempt to delete physical file if exists
    try {
      const filePath = path.join(__dirname, '..', 'uploads', document.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.warn('File unlinking error:', e.message);
    }

    // Remove from application references
    if (document.application) {
      await Application.findByIdAndUpdate(document.application, {
        $pull: { documents: document._id },
      });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const Application = require('../models/Application');
const Program = require('../models/Program');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');

// Helper to generate unique Application Number
const generateAppNumber = () => {
  const year = new Date().getFullYear();
  const randomChars = Math.floor(100000 + Math.random() * 900000);
  return `APP-${year}-${randomChars}`;
};

// @desc    Get all applications for the logged in student
// @route   GET /api/applications/my-applications
// @access  Private (Student)
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('program')
      .populate('documents')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private (Student owner, Faculty, Admin)
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email phone avatar')
      .populate('program')
      .populate('documents')
      .populate('payment')
      .populate('evaluation.evaluatedBy', 'name email department')
      .populate('statusHistory.updatedBy', 'name role');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Role check: Students can only view their own applications
    if (
      req.user.role === 'student' &&
      application.student._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this application.',
      });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new application draft
// @route   POST /api/applications
// @access  Private (Student)
exports.createApplication = async (req, res, next) => {
  try {
    const { programId, intakeTerm } = req.body;

    if (!programId) {
      return res.status(400).json({
        success: false,
        message: 'Please select an academic program.',
      });
    }

    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Selected academic program does not exist.',
      });
    }

    if (program.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This program is currently not accepting applications.',
      });
    }

    // Check if student already has an active application for this program
    const existingApp = await Application.findOne({
      student: req.user.id,
      program: programId,
      status: { $nin: ['Rejected'] },
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: `You already have an existing application (${existingApp.applicationNumber}) for this program with status: ${existingApp.status}.`,
        applicationId: existingApp._id,
      });
    }

    // Pull student profile defaults
    const profile = await StudentProfile.findOne({ user: req.user.id });

    let appNumber = generateAppNumber();
    // Ensure uniqueness
    let conflict = await Application.findOne({ applicationNumber: appNumber });
    while (conflict) {
      appNumber = generateAppNumber();
      conflict = await Application.findOne({ applicationNumber: appNumber });
    }

    const newApp = await Application.create({
      applicationNumber: appNumber,
      student: req.user.id,
      program: programId,
      intakeTerm: intakeTerm || program.intakeSeason || 'Fall 2026',
      status: 'Draft',
      currentStep: 1,
      personalInfo: {
        fullName: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '',
        dateOfBirth: profile?.dateOfBirth,
        gender: profile?.gender,
        nationality: profile?.nationality || 'Indian',
        address: profile?.address || {},
        emergencyContact: profile?.emergencyContact || {},
      },
      academicInfo: {
        highestQualification: profile?.academicHistory?.[0]?.level || '',
        institution: profile?.academicHistory?.[0]?.institution || '',
        boardOrUniversity: profile?.academicHistory?.[0]?.boardOrUniversity || '',
        graduationYear: profile?.academicHistory?.[0]?.yearOfPassing,
        cgpaOrPercentage: profile?.academicHistory?.[0]?.percentageOrCgpa || '',
        majorSubject: profile?.academicHistory?.[0]?.majorSubjects || '',
        standardizedTest: {
          name: profile?.standardizedTests?.[0]?.testName || '',
          score: profile?.standardizedTests?.[0]?.score || '',
          examDate: profile?.standardizedTests?.[0]?.testDate,
        },
      },
      statusHistory: [
        {
          status: 'Draft',
          updatedBy: req.user.id,
          note: 'Application draft initiated',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Application draft created successfully',
      application: newApp,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application steps & fields
// @route   PUT /api/applications/:id/step
// @access  Private (Student)
exports.updateApplicationStep = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this application.',
      });
    }

    if (!['Draft', 'Under Review'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Application cannot be modified while status is ${application.status}.`,
      });
    }

    const { step, personalInfo, academicInfo, documents } = req.body;

    if (step) application.currentStep = step;
    if (personalInfo) {
      application.personalInfo = { ...application.personalInfo, ...personalInfo };
    }
    if (academicInfo) {
      application.academicInfo = { ...application.academicInfo, ...academicInfo };
    }
    if (documents) {
      application.documents = documents;
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application saved successfully',
      application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Final submit application
// @route   POST /api/applications/:id/submit
// @access  Private (Student)
exports.submitApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('program');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this application.',
      });
    }

    if (application.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}.`,
      });
    }

    // Check payment if required
    if (application.paymentStatus !== 'paid' && application.program.applicationFee > 0) {
      return res.status(400).json({
        success: false,
        message: 'Application fee payment is pending. Please complete fee payment before submitting.',
      });
    }

    application.status = 'Submitted';
    application.submittedAt = new Date();
    application.currentStep = 5;
    application.statusHistory.push({
      status: 'Submitted',
      updatedBy: req.user.id,
      note: 'Application formally submitted by candidate.',
    });

    await application.save();

    // Trigger in-app notification
    await Notification.create({
      recipient: req.user.id,
      title: 'Application Submitted Successfully! 🎓',
      message: `Your application (${application.applicationNumber}) for ${application.program.name} has been received and queued for faculty review.`,
      type: 'status_change',
      relatedApplication: application._id,
      link: `/student/applications/${application._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully! Our admissions committee will review your submission.',
      application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applications (Admin & Faculty)
// @route   GET /api/applications
// @access  Private (Admin, Faculty)
exports.getAllApplications = async (req, res, next) => {
  try {
    const { status, program, department, search, sort } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (program && program !== 'All') {
      query.program = program;
    }

    let applications = await Application.find(query)
      .populate('student', 'name email phone avatar')
      .populate('program')
      .populate('documents')
      .populate('payment')
      .populate('evaluation.evaluatedBy', 'name email department')
      .sort({ createdAt: -1 });

    // Filter by department if specified
    if (department && department !== 'All') {
      applications = applications.filter(
        (app) => app.program && app.program.department === department
      );
    }

    // Filter by search string
    if (search) {
      const s = search.toLowerCase();
      applications = applications.filter((app) => {
        const studentName = app.student?.name?.toLowerCase() || '';
        const studentEmail = app.student?.email?.toLowerCase() || '';
        const appNum = app.applicationNumber?.toLowerCase() || '';
        const progName = app.program?.name?.toLowerCase() || '';
        return (
          studentName.includes(s) ||
          studentEmail.includes(s) ||
          appNum.includes(s) ||
          progName.includes(s)
        );
      });
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status (Admin or Faculty review)
// @route   PUT /api/applications/:id/status
// @access  Private (Admin, Faculty)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note, admissionOfferNotes } = req.body;

    const validStatuses = [
      'Draft',
      'Submitted',
      'Under Review',
      'Verified',
      'Approved',
      'Rejected',
      'Waitlisted',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id).populate('program');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const prevStatus = application.status;
    application.status = status;
    if (admissionOfferNotes) application.admissionOfferNotes = admissionOfferNotes;

    if (['Approved', 'Rejected', 'Waitlisted'].includes(status)) {
      application.decisionDate = new Date();
    }

    // If status became Approved and wasn't before, update program enrolledCount
    if (status === 'Approved' && prevStatus !== 'Approved') {
      await Program.findByIdAndUpdate(application.program._id, {
        $inc: { enrolledCount: 1 },
      });
    } else if (prevStatus === 'Approved' && status !== 'Approved') {
      await Program.findByIdAndUpdate(application.program._id, {
        $inc: { enrolledCount: -1 },
      });
    }

    application.statusHistory.push({
      status,
      updatedBy: req.user.id,
      note: note || `Application status changed from ${prevStatus} to ${status}.`,
    });

    await application.save();

    // Trigger student notification
    let statusEmoji = '📢';
    if (status === 'Approved') statusEmoji = '🎉';
    if (status === 'Rejected') statusEmoji = 'ℹ️';
    if (status === 'Waitlisted') statusEmoji = '⏳';
    if (status === 'Verified') statusEmoji = '✅';

    await Notification.create({
      recipient: application.student,
      sender: req.user.id,
      title: `${statusEmoji} Application Status Updated: ${status}`,
      message: `Your application ${application.applicationNumber} for ${application.program.name} is now '${status}'. ${note ? `Note: ${note}` : ''}`,
      type: 'status_change',
      relatedApplication: application._id,
      link: `/student/applications/${application._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Status updated to '${status}' successfully.`,
      application,
    });
  } catch (err) {
    next(err);
  }
};

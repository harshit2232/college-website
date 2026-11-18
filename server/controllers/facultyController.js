const Application = require('../models/Application');
const Notification = require('../models/Notification');

// @desc    Get faculty evaluation queue (applications for department or global)
// @route   GET /api/faculty/queue
// @access  Private (Faculty, Admin)
exports.getEvaluationQueue = async (req, res, next) => {
  try {
    const { status, program, search } = req.query;

    const query = {
      status: { $in: ['Submitted', 'Under Review', 'Verified', 'Approved', 'Waitlisted', 'Rejected'] },
    };

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
      .sort({ submittedAt: 1, createdAt: -1 });

    // If faculty has a department, we can highlight or filter
    if (req.user.department && req.query.onlyMyDept === 'true') {
      applications = applications.filter(
        (app) => app.program?.department === req.user.department
      );
    }

    if (search) {
      const s = search.toLowerCase();
      applications = applications.filter((app) => {
        const studentName = app.student?.name?.toLowerCase() || '';
        const appNum = app.applicationNumber?.toLowerCase() || '';
        const progName = app.program?.name?.toLowerCase() || '';
        return studentName.includes(s) || appNum.includes(s) || progName.includes(s);
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

// @desc    Submit evaluation scores & recommendation
// @route   POST /api/faculty/evaluate/:id
// @access  Private (Faculty, Admin)
exports.submitEvaluation = async (req, res, next) => {
  try {
    const {
      academicScore,
      interviewScore,
      statementScore,
      recommendation,
      interviewNotes,
      comments,
      newStatus,
      interviewDate,
    } = req.body;

    const application = await Application.findById(req.params.id).populate('program');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const aScore = academicScore !== undefined ? Number(academicScore) : (application.evaluation?.academicScore || 0);
    const iScore = interviewScore !== undefined ? Number(interviewScore) : (application.evaluation?.interviewScore || 0);
    const sScore = statementScore !== undefined ? Number(statementScore) : (application.evaluation?.statementScore || 0);
    const totalScore = Math.round((aScore + iScore + sScore) / 3);

    application.evaluation = {
      evaluatedBy: req.user.id,
      evaluatedAt: new Date(),
      academicScore: aScore,
      interviewScore: iScore,
      statementScore: sScore,
      totalScore,
      recommendation: recommendation || application.evaluation?.recommendation || 'pending',
      interviewNotes: interviewNotes !== undefined ? interviewNotes : (application.evaluation?.interviewNotes || ''),
      comments: comments !== undefined ? comments : (application.evaluation?.comments || ''),
      interviewDate: interviewDate ? new Date(interviewDate) : application.evaluation?.interviewDate,
    };

    // If newStatus provided, update application status
    if (newStatus && application.status !== newStatus) {
      const prevStatus = application.status;
      application.status = newStatus;
      if (['Approved', 'Rejected', 'Waitlisted'].includes(newStatus)) {
        application.decisionDate = new Date();
      }
      application.statusHistory.push({
        status: newStatus,
        updatedBy: req.user.id,
        note: `Evaluation score: ${totalScore}/100. Recommendation: ${recommendation || 'pending'}. ${comments || ''}`,
      });
    }

    await application.save();

    // Trigger candidate notification if recommendation is ready
    if (newStatus) {
      await Notification.create({
        recipient: application.student,
        sender: req.user.id,
        title: `Faculty Review Updated: ${newStatus}`,
        message: `Your application (${application.applicationNumber}) has been reviewed by the admissions committee. Current Status: ${newStatus}.`,
        type: 'status_change',
        relatedApplication: application._id,
        link: `/student/applications/${application._id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Evaluation saved successfully',
      application,
    });
  } catch (err) {
    next(err);
  }
};

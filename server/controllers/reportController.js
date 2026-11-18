const Application = require('../models/Application');
const Program = require('../models/Program');
const Payment = require('../models/Payment');
const User = require('../models/User');

// @desc    Get complete admissions dashboard analytics
// @route   GET /api/reports/analytics
// @access  Private (Admin, Faculty)
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const [applications, programs, payments, studentsCount, facultyCount] = await Promise.all([
      Application.find().populate('program').populate('student', 'name email'),
      Program.find(),
      Payment.find({ status: 'success' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
    ]);

    const totalApplications = applications.length;

    // Status counts
    const statusCounts = {
      Draft: 0,
      Submitted: 0,
      'Under Review': 0,
      Verified: 0,
      Approved: 0,
      Rejected: 0,
      Waitlisted: 0,
    };

    applications.forEach((app) => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
    });

    // Decided applications (Approved + Rejected + Waitlisted)
    const decidedCount = statusCounts.Approved + statusCounts.Rejected + statusCounts.Waitlisted;
    const acceptanceRate = decidedCount > 0
      ? Number(((statusCounts.Approved / decidedCount) * 100).toFixed(1))
      : 0;

    // Total Fee Revenue
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Total Seats & Enrolled
    const totalCapacity = programs.reduce((sum, p) => sum + (p.seatCapacity || 0), 0);
    const totalEnrolled = programs.reduce((sum, p) => sum + (p.enrolledCount || 0), 0);
    const seatOccupancyRate = totalCapacity > 0
      ? Number(((totalEnrolled / totalCapacity) * 100).toFixed(1))
      : 0;

    // Department-wise distribution
    const deptMap = {};
    programs.forEach((prog) => {
      if (!deptMap[prog.department]) {
        deptMap[prog.department] = {
          department: prog.department,
          programsCount: 0,
          totalSeats: 0,
          applications: 0,
          approved: 0,
          revenue: 0,
        };
      }
      deptMap[prog.department].programsCount++;
      deptMap[prog.department].totalSeats += prog.seatCapacity || 0;
    });

    applications.forEach((app) => {
      const dept = app.program?.department;
      if (dept && deptMap[dept]) {
        deptMap[dept].applications++;
        if (app.status === 'Approved') {
          deptMap[dept].approved++;
        }
        if (app.paymentStatus === 'paid' && app.program?.applicationFee) {
          deptMap[dept].revenue += app.program.applicationFee;
        }
      }
    });

    const departmentBreakdown = Object.values(deptMap);

    // Status chart data
    const statusChartData = [
      { name: 'Approved', count: statusCounts.Approved, color: '#10b981' },
      { name: 'Under Review', count: statusCounts['Under Review'], color: '#f59e0b' },
      { name: 'Verified', count: statusCounts.Verified, color: '#3b82f6' },
      { name: 'Submitted', count: statusCounts.Submitted, color: '#6366f1' },
      { name: 'Waitlisted', count: statusCounts.Waitlisted, color: '#8b5cf6' },
      { name: 'Rejected', count: statusCounts.Rejected, color: '#ef4444' },
      { name: 'Draft', count: statusCounts.Draft, color: '#94a3b8' },
    ];

    // Program popularity (top 5 by applications)
    const progMap = {};
    applications.forEach((app) => {
      if (app.program) {
        const id = app.program._id.toString();
        if (!progMap[id]) {
          progMap[id] = {
            name: app.program.name,
            code: app.program.code,
            department: app.program.department,
            seats: app.program.seatCapacity,
            applications: 0,
            approved: 0,
          };
        }
        progMap[id].applications++;
        if (app.status === 'Approved') progMap[id].approved++;
      }
    });

    const programPopularity = Object.values(progMap)
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 6);

    // Recent 5 applications
    const recentApplications = applications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((app) => ({
        _id: app._id,
        applicationNumber: app.applicationNumber,
        studentName: app.student?.name || 'Applicant',
        programName: app.program?.name || 'Program',
        status: app.status,
        date: app.createdAt,
        paymentStatus: app.paymentStatus,
      }));

    res.status(200).json({
      success: true,
      metrics: {
        totalApplications,
        approvedCount: statusCounts.Approved,
        rejectedCount: statusCounts.Rejected,
        waitlistCount: statusCounts.Waitlisted,
        pendingReviewCount: statusCounts['Under Review'] + statusCounts.Submitted + statusCounts.Verified,
        acceptanceRate,
        totalRevenue,
        totalPrograms: programs.length,
        totalStudents: studentsCount,
        facultyCount,
        totalCapacity,
        totalEnrolled,
        seatOccupancyRate,
      },
      statusChartData,
      departmentBreakdown,
      programPopularity,
      recentApplications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export applications as CSV data
// @route   GET /api/reports/export-csv
// @access  Private (Admin)
exports.exportApplicationsCSV = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('student', 'name email phone')
      .populate('program', 'name code department applicationFee degree')
      .populate('payment', 'transactionId receiptNumber amount status')
      .sort({ createdAt: -1 });

    const headers = [
      'Application Number',
      'Student Name',
      'Student Email',
      'Student Phone',
      'Program Name',
      'Program Code',
      'Degree',
      'Department',
      'Application Status',
      'Payment Status',
      'Fee Amount (₹ INR)',
      'Transaction ID',
      'Receipt Number',
      'Submission Date',
      'Decision Date',
    ];

    const rows = applications.map((app) => [
      `"${app.applicationNumber}"`,
      `"${app.student?.name || ''}"`,
      `"${app.student?.email || ''}"`,
      `"${app.student?.phone || ''}"`,
      `"${app.program?.name || ''}"`,
      `"${app.program?.code || ''}"`,
      `"${app.program?.degree || ''}"`,
      `"${app.program?.department || ''}"`,
      `"${app.status}"`,
      `"${app.paymentStatus}"`,
      `"${app.program?.applicationFee || 0}"`,
      `"${app.payment?.transactionId || 'N/A'}"`,
      `"${app.payment?.receiptNumber || 'N/A'}"`,
      `"${app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}"`,
      `"${app.decisionDate ? new Date(app.decisionDate).toLocaleDateString() : 'Pending'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment(`IEM_Admissions_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    return res.send(csvContent);
  } catch (err) {
    next(err);
  }
};

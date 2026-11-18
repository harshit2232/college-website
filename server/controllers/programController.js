const Program = require('../models/Program');
const Application = require('../models/Application');

// @desc    Get all programs (with filtering, search)
// @route   GET /api/programs
// @access  Public
exports.getPrograms = async (req, res, next) => {
  try {
    const { search, department, degree, status, sort } = req.query;

    const query = {};

    // If not admin, only show active programs by default
    if (!req.user || req.user.role !== 'admin') {
      query.status = 'active';
    } else if (status) {
      query.status = status;
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (degree && degree !== 'All') {
      query.degree = degree;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let queryExec = Program.find(query);

    if (sort === 'fee_asc') {
      queryExec = queryExec.sort({ applicationFee: 1 });
    } else if (sort === 'fee_desc') {
      queryExec = queryExec.sort({ applicationFee: -1 });
    } else if (sort === 'deadline') {
      queryExec = queryExec.sort({ applicationDeadline: 1 });
    } else {
      queryExec = queryExec.sort({ featured: -1, createdAt: -1 });
    }

    const programs = await queryExec;

    // Get unique departments & degrees for filtering
    const departments = await Program.distinct('department');
    const degrees = await Program.distinct('degree');

    res.status(200).json({
      success: true,
      count: programs.length,
      departments,
      degrees,
      programs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single program details
// @route   GET /api/programs/:id
// @access  Public
exports.getProgramById = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Academic Program not found.',
      });
    }

    // Also get applications count for admin/faculty
    let applicationCount = 0;
    if (req.user && ['admin', 'faculty'].includes(req.user.role)) {
      applicationCount = await Application.countDocuments({ program: program._id });
    }

    res.status(200).json({
      success: true,
      program,
      applicationCount,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new program
// @route   POST /api/programs
// @access  Private (Admin)
exports.createProgram = async (req, res, next) => {
  try {
    const {
      name,
      code,
      degree,
      department,
      duration,
      description,
      eligibilityCriteria,
      applicationFee,
      seatCapacity,
      intakeSeason,
      applicationDeadline,
      status,
      featured,
    } = req.body;

    const existingProgram = await Program.findOne({ code: code.toUpperCase() });
    if (existingProgram) {
      return res.status(400).json({
        success: false,
        message: `Program with code ${code} already exists.`,
      });
    }

    const program = await Program.create({
      name,
      code: code.toUpperCase(),
      degree,
      department,
      duration,
      description,
      eligibilityCriteria: Array.isArray(eligibilityCriteria)
        ? eligibilityCriteria
        : [eligibilityCriteria],
      applicationFee: Number(applicationFee),
      seatCapacity: Number(seatCapacity),
      intakeSeason: intakeSeason || 'Fall 2026',
      applicationDeadline: new Date(applicationDeadline),
      status: status || 'active',
      featured: Boolean(featured),
    });

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      program,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private (Admin)
exports.updateProgram = async (req, res, next) => {
  try {
    let program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found.',
      });
    }

    program = await Program.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Program updated successfully',
      program,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private (Admin)
exports.deleteProgram = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found.',
      });
    }

    // Check if any applications exist for this program
    const appsCount = await Application.countDocuments({ program: program._id });
    if (appsCount > 0) {
      // Soft-archive by setting status to closed
      program.status = 'closed';
      await program.save();
      return res.status(200).json({
        success: true,
        message: `Program has ${appsCount} existing application(s). Status has been changed to 'closed' instead of permanent deletion.`,
      });
    }

    await Program.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Program permanently deleted.',
    });
  } catch (err) {
    next(err);
  }
};

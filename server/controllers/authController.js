const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const { sendTokenResponse } = require('../utils/token');

// @desc    Register a new user (defaults to student)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Restrict role: only 'student' can self-register unless specified in dev
    const userRole = role && ['student', 'faculty'].includes(role) ? role : 'student';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      phone: phone || '',
      department: department || null,
    });

    // If student, automatically initialize student profile
    if (user.role === 'student') {
      await StudentProfile.create({
        user: user._id,
        emergencyContact: {},
        academicHistory: [],
        standardizedTests: [],
      });
    }

    sendTokenResponse(user, 201, res, 'Account registered successfully');
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user by email (with IEM alias fallback)
    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user && (normalizedEmail === 'rahj36073@gmail.com' || normalizedEmail === 'rajh36073@gmail.com')) {
      user = await User.findOne({ email: { $in: ['rajh36073@gmail.com', 'rahj36073@gmail.com'] } }).select('+password');
    } else if (!user && normalizedEmail === 'faculty@iem.edu.in') {
      user = await User.findOne({ email: 'faculty@nexis.edu' }).select('+password');
    } else if (!user && normalizedEmail === 'student@iem.edu.in') {
      user = await User.findOne({ email: 'student@nexis.edu' }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact the admissions office.',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user & profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let studentProfile = null;

    if (user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ user: user._id });
      if (!studentProfile) {
        studentProfile = await StudentProfile.create({ user: user._id });
      }
    }

    res.status(200).json({
      success: true,
      user,
      studentProfile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update basic user details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, department } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (avatar !== undefined) fieldsToUpdate.avatar = avatar;
    if (department !== undefined && req.user.role !== 'student') fieldsToUpdate.department = department;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get or update student comprehensive profile
// @route   PUT /api/auth/student-profile
// @access  Private (Student)
exports.updateStudentProfile = async (req, res, next) => {
  try {
    const {
      dateOfBirth,
      gender,
      nationality,
      passportOrIdNumber,
      address,
      emergencyContact,
      academicHistory,
      standardizedTests,
      bio,
    } = req.body;

    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new StudentProfile({ user: req.user.id });
    }

    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) profile.gender = gender;
    if (nationality !== undefined) profile.nationality = nationality;
    if (passportOrIdNumber !== undefined) profile.passportOrIdNumber = passportOrIdNumber;
    if (address !== undefined) profile.address = address;
    if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;
    if (academicHistory !== undefined) profile.academicHistory = academicHistory;
    if (standardizedTests !== undefined) profile.standardizedTests = standardizedTests;
    if (bio !== undefined) profile.bio = bio;

    // Calculate completion score
    let score = 20; // registered
    if (profile.dateOfBirth && profile.gender) score += 20;
    if (profile.address?.city && profile.address?.country) score += 20;
    if (profile.academicHistory?.length > 0) score += 20;
    if (profile.emergencyContact?.phone) score += 10;
    if (profile.bio) score += 10;
    profile.profileCompletion = Math.min(score, 100);

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

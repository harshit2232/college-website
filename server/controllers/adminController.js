const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const Program = require('../models/Program');

// @desc    Get all users with search, role, status filters
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;

    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new user (Admin adding faculty or admin)
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'faculty',
      department: department || '',
      phone: phone || '',
      status: 'active',
    });

    if (user.role === 'student') {
      await StudentProfile.create({ user: user._id });
    }

    res.status(201).json({
      success: true,
      message: `${user.role.toUpperCase()} account created successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user status / role / department
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, department, status, phone } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Prevent deactivating own admin account
    if (user._id.toString() === req.user.id && status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own active admin account.',
      });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (status) user.status = status;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    // Clean up applications or profiles if student
    if (user.role === 'student') {
      await StudentProfile.deleteOne({ user: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'your_jwt_secret_key_here', 
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user (Candidate or Recruiter)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields: name, email, password, role'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email is already registered'
      });
    }

    // Validate role
    const uppercaseRole = role.toUpperCase();
    if (uppercaseRole !== 'CANDIDATE' && uppercaseRole !== 'RECRUITER') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be CANDIDATE or RECRUITER'
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: passwordHash,
        role: uppercaseRole
      }
    });

    // Generate Token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        resumeUrl: user.resumeUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate Token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        resumeUrl: user.resumeUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        resumeUrl: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (Success API message)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password (Placeholder implementation)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Simulate sending email
    res.status(200).json({
      success: true,
      message: `Password reset instructions sent to ${email} (simulated API response)`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile resume
// @route   PUT /api/auth/resume
// @access  Private (Candidate only)
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file'
      });
    }

    if (req.user.role !== 'CANDIDATE') {
      return res.status(403).json({
        success: false,
        message: 'Only candidates can upload profile resumes'
      });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { resumeUrl },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        resumeUrl: true,
        createdAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  forgotPassword,
  uploadResume
};

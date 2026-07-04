const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this resource. Please login.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');

    // Get user from token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        resumeUrl: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Grant access and store user details in request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired.'
    });
  }
};

// Restrict access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permissions to perform this action.'
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};

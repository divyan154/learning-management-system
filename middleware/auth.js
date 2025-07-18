const jwt = require('jsonwebtoken');
const User = require('../models/User');



const authenticate = async (req, res, next) => {
  try {
    if (!req.cookies || !req.cookies.token) {
      req.user = null;
      return next();
    }
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    req.user = user || null;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    req.user = null;
    next();
  }
};


const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    req.flash('error_msg', 'Admin access required');
    return res.redirect('/');
  }
  next();
};
module.exports = { authenticate, authorize ,requireAdmin};
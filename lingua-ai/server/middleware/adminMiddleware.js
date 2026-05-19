const User = require('../models/User');

const admin = async (req, res, next) => {
  try {
    // req.user was already attached by protect middleware
    const user = await User.findById(req.user.id);

    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { admin };

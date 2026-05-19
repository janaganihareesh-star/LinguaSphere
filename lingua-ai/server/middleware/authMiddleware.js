const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (just the id from token)
      req.user = decoded;

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired, please login again' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token, access denied' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, access denied' });
  }
};

module.exports = { protect };

const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    const token = req.header('authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      // Enforce single admin
      if (decoded.role === 'admin') {
        const adminCount = await require('../models/User').countDocuments({ role: 'admin' });
        if (adminCount > 1) {
          return res.status(403).json({ message: 'Multiple admins detected' });
        }
      }
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = authMiddleware;
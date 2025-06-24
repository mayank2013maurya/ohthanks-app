const jwt = require('jsonwebtoken');

const optionalAuthMiddleware = async (req, res, next) => {
  const token = req.header('authorization')?.replace('Bearer ', '');
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Still proceed if token is invalid, but don't attach user
    next();
  }
};

module.exports = optionalAuthMiddleware; 
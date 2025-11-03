const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

/**
 * @description Middleware to protect routes by verifying JWT token.
 * It checks for a valid token in the Authorization header.
 * If valid, it attaches the user object to the request (req.user).
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check if the 'Authorization' header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Get the token from the header (e.g., "Bearer [token]")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user from the token's ID and attach it to the request object
      // We exclude the password when fetching the user
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      // 4. Continue to the next function (the controller)
      next();

    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * @description Middleware to restrict access to Coordinators and Admins.
 * This MUST run *after* the 'protect' middleware.
 */
exports.isCoordinator = (req, res, next) => {
  if (req.user && (req.user.role === 'coordinator' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Coordinator or Admin role required.' });
  }
};
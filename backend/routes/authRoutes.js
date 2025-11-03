const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route POST /api/auth/send-otp
 * @desc Stage 1 of Registration: Send OTP to email
 * @access Public
 */
router.post('/send-otp', authController.sendVerificationOTP);

/**
 * @route POST /api/auth/verify-email-otp
 * @desc Stage 2 of Registration: Verify the OTP
 * @access Public
 */
router.post('/verify-email-otp', authController.verifyEmailOTP);

/**
 * @route POST /api/auth/register
 * @desc Stage 3 of Registration: Finalize account creation
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Log in a verified user
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request a password reset link via email
 * @access Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route PUT /api/auth/reset-password/:token
 * @desc Submit a new password using the reset token
 * @access Public
 */
router.put('/reset-password/:token', authController.resetPassword);

module.exports = router;
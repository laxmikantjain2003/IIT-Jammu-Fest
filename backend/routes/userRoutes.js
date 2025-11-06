const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import the main security middleware
const { profilePicUpload } = require('../middleware/profilePicUpload'); // Import the specific uploader

/**
 * @route PUT /api/users/profile-pic
 * @desc Upload or update the user's profile picture
 * @access Private
 */
router.put('/profile-pic', protect, profilePicUpload, userController.uploadProfilePic);

/**
 * @route DELETE /api/users/profile-pic
 * @desc Remove the user's profile picture
 * @access Private
 */
router.delete('/profile-pic', protect, userController.removeProfilePic);

/**
 * @route PUT /api/users/me/password
 * @desc Update the authenticated user's password
 * @access Private
 */
router.put('/me/password', protect, userController.updatePassword);

/**
 * @route DELETE /api/users/me
 * @desc Delete the authenticated user's account
 * @access Private
 */
router.delete('/me', protect, userController.deleteMe);

/**
 * @route GET /api/users/me/my-registrations
 * @desc Get all event IDs the user is registered for
 * @access Private
 */
router.get('/me/my-registrations', protect, userController.getMyRegistrations);


module.exports = router;
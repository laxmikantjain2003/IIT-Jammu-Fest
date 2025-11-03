const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { protect, isCoordinator } = require('../middleware/authMiddleware');
const { logoUpload } = require('../middleware/logoUpload'); // The specific uploader for 'logo' field

/**
 * @route GET /api/clubs
 * @desc Get all Clubs (Public)
 * @access Public
 */
router.get('/', clubController.getAllClubs);

/**
 * @route GET /api/clubs/:id
 * @desc Get details for one specific Club (Public)
 * @access Public
 */
router.get('/:id', clubController.getClubDetails);

/**
 * @route POST /api/clubs
 * @desc Create a new Club
 * @access Private (Coordinator/Admin only)
 */
router.post('/', protect, isCoordinator, logoUpload, clubController.createClub);

/**
 * @route PUT /api/clubs/:id
 * @desc Update Club Details (name, description, logo)
 * @access Private (Coordinator/Admin only)
 */
router.put('/:id', protect, isCoordinator, logoUpload, clubController.updateClub);

module.exports = router;
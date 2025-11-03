const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { protect, isCoordinator } = require('../middleware/authMiddleware');
const { photoUpload } = require('../middleware/photoUpload'); // The specific uploader for 'file' field

/**
 * @route GET /api/photos/:clubId
 * @desc Get all photos for a specific club (Public)
 * @access Public
 */
router.get('/:clubId', photoController.getClubPhotos);

/**
 * @route POST /api/photos/:clubId
 * @desc Upload a new photo to the club gallery
 * @access Private (Coordinator/Admin only)
 */
router.post('/:clubId', protect, isCoordinator, photoUpload, photoController.uploadPhoto);

/**
 * @route DELETE /api/photos/delete/:photoId
 * @desc Delete a photo from the club gallery
 * @access Private (Coordinator/Admin only)
 */
router.delete('/delete/:photoId', protect, isCoordinator, photoController.deletePhoto);

module.exports = router;
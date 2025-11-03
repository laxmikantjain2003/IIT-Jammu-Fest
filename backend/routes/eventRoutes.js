const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, isCoordinator } = require('../middleware/authMiddleware');

/**
 * @route GET /api/events
 * @desc Get all upcoming Events (Public)
 * @access Public
 */
router.get('/', eventController.getAllEvents);

/**
 * @route POST /api/events
 * @desc Create a new Event
 * @access Private (Coordinator/Admin only)
 */
router.post('/', protect, isCoordinator, eventController.createEvent);

/**
 * @route GET /api/events/my-events
 * @desc Get all events for the logged-in coordinator (for Dashboard)
 * @access Private (Coordinator/Admin only)
 */
router.get('/my-events', protect, isCoordinator, eventController.getMyEvents);

/**
 * @route GET /api/events/:eventId/export
 * @desc Export a CSV file of registered students
 * @access Private (Coordinator/Admin only)
 */
router.get('/:eventId/export', protect, isCoordinator, eventController.exportRegistrations);

/**
 * @route POST /api/events/:eventId/register
 * @desc Register a Student for an Event
 * @access Private (Logged-in users only)
 */
router.post('/:eventId/register', protect, eventController.registerForEvent);

module.exports = router;
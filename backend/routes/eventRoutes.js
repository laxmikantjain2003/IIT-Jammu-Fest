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
 * @desc Create a new Event (and send notifications)
 * @access Private (Coordinator/Admin only)
 */
// The route is just '/' because the base '/api/events' is defined in server.js
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
 * @desc Register a Student or Coordinator for an Event
 * @access Private (Logged-in users only)
 */
router.post('/:eventId/register', protect, eventController.registerForEvent);

/**
 * --- NEW ROUTE ---
 * @route GET /api/events/:id
 * @desc Get details for one specific Event (Public)
 * @access Public
 */
router.get('/:id', eventController.getEventById);

/**
 * --- NEW ROUTE ---
 * @route PUT /api/events/:id
 * @desc Update an event's details
 * @access Private (Coordinator/Admin only)
 */
router.put('/:id', protect, isCoordinator, eventController.updateEvent);

module.exports = router;
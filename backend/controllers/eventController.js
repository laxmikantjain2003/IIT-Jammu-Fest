const Event = require('../models/Event');
const User = require('../models/user');
const Registration = require('../models/Registration');
const papaparse = require('papaparse'); 
const sendEmail = require('../utils/sendEmail'); 
const { Op } = require('../database'); 

/**
 * @description Create a new Event.
 * (Unchanged - Includes email notification)
 */
exports.createEvent = async (req, res) => {
  try {
    const { title, description, venue, eventDate, clubName } = req.body;
    const coordinatorId = req.user.id;
    
    const newEvent = await Event.create({
      title, description, venue, eventDate, clubName, coordinatorId
    });

    // --- Event Notification Feature ---
    const users = await User.findAll({
        where: { isVerified: true }, 
        attributes: ['email'],
    });
    const recipientEmails = users.map(user => user.email).join(', ');
    
    const notificationMessage = `
      Hello IIT Jammu Community,
      A new event has been officially posted:
      Title: ${title}
      Club: ${clubName}
      Venue: ${venue}
      Date & Time: ${new Date(eventDate).toLocaleString()}
      Visit the portal to register now!
      http://localhost:3000/events
    `;

    sendEmail({
        email: recipientEmails,
        subject: `[New Event Alert] ${clubName}: ${title}`,
        message: notificationMessage,
    }).catch(err => {
      console.error("Email notification failed to send:", err);
    });
    // --- End Notification Feature ---

    res.status(201).json({
      message: "Event created successfully and notification sent!",
      event: newEvent
    });

  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ message: "Server error while creating event." });
  }
};

/**
 * @description Get all upcoming Events (Public).
 * (Unchanged)
 */
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['eventDate', 'ASC']],
      include: {
        model: User, 
        attributes: ['name', 'email']
      }
    });
    res.status(200).json(events);
  } catch (error) {
    console.error("Get all events error:", error);
    res.status(500).json({ message: "Server error while fetching events." });
  }
};

// --- NEW FUNCTION: Get a Single Event by ID ---
/**
 * @description Get details for one specific Event (Public).
 * @route GET /api/events/:id
 */
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: {
        model: User, // Include coordinator's details
        attributes: ['name', 'email']
      }
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    
    res.status(200).json(event);

  } catch (error) {
    console.error("Get event by ID error:", error);
    res.status(500).json({ message: "Server error while fetching event." });
  }
};

/**
 * @description Register a Student OR Coordinator for an Event.
 * (Unchanged - Includes self-registration block & confirmation email)
 */
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id; 

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Check coordinator self-registration
    if (event.coordinatorId === userId) {
      return res.status(403).json({ 
        message: "You cannot register for an event that you are coordinating." 
      });
    }

    const existingRegistration = await Registration.findOne({
      where: { userId: userId, eventId: eventId }
    });
    if (existingRegistration) {
      return res.status(400).json({ message: "You are already registered for this event." });
    }

    await Registration.create({ userId, eventId });

    // Send success response to frontend IMMEDIATELY.
    res.status(201).json({ message: "Registered for event successfully! A confirmation email is being sent." });

    // Send confirmation email in the background
    try {
        const user = await User.findByPk(userId, { attributes: ['name', 'email'] });
        const confirmationMessage = `
          Hello ${user.name},
          You have successfully registered for the following event:
          Event: ${event.title}
          Date: ${new Date(event.eventDate).toLocaleString()}
          Venue: ${event.venue}
          We look forward to seeing you there!
        `;
        
        // We use 'sendEmail' but DO NOT 'await' it, so it doesn't block
        sendEmail({
            email: user.email,
            subject: `Registration Confirmed: ${event.title}`,
            message: confirmationMessage,
        }).catch(err => console.error("Failed to send confirmation email:", err));
    } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
    }

  } catch (error) {
    console.error("Event registration error:", error);
    res.status(500).json({ message: "Server error during event registration." });
  }
};

// --- NEW FUNCTION: Update an Event ---
/**
 * @description Update an event's details (Coordinator only).
 * @route PUT /api/events/:id
 */
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL
    const coordinatorId = req.user.id;
    const { title, description, venue, eventDate, clubName } = req.body;

    // 1. Find the event
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // 2. SECURITY CHECK: Ensure the logged-in user is the owner
    if (event.coordinatorId !== coordinatorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "You are not authorized to update this event." });
    }

    // 3. Update the fields
    event.title = title;
    event.description = description;
    event.venue = venue;
    event.eventDate = eventDate;
    event.clubName = clubName;

    // 4. Save changes to the database
    await event.save();

    // 5. (Optional but good) Notify registered users of the change
    const registeredUsers = await event.getRegisteredStudents({ attributes: ['email'] });
    if (registeredUsers.length > 0) {
      const recipientEmails = registeredUsers.map(user => user.email).join(', ');
      const message = `
        Hello,
        Please note that details for an event you are registered for have changed:

        Event: ${title}
        New Date: ${new Date(eventDate).toLocaleString()}
        New Venue: ${venue}

        Please check the portal for full details.
      `;
      sendEmail({
        email: recipientEmails,
        subject: `[EVENT UPDATE] ${title}`,
        message: message
      }).catch(err => console.error("Failed to send event update email:", err));
    }

    res.status(200).json({ message: "Event updated successfully!", event: event });

  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ message: "Server error while updating event." });
  }
};


/**
 * @description Get all events created by the logged-in coordinator.
 * (Unchanged)
 */
exports.getMyEvents = async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const events = await Event.findAll({
      where: { coordinatorId: coordinatorId },
      order: [['eventDate', 'ASC']],
      include: {
        model: User,
        as: 'RegisteredStudents', 
        attributes: ['name', 'email'],
        through: { attributes: [] }
      }
    });
    res.status(200).json(events);
  } catch (error) {
    console.error("Get my events error:", error);
    res.status(500).json({ message: "Server error while fetching events." });
  }
};

/**
 * @description Export a CSV file of registered students for an event.
 * (Unchanged)
 */
exports.exportRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const coordinatorId = req.user.id;
    const event = await Event.findOne({
      where: { id: eventId, coordinatorId: coordinatorId },
      include: {
        model: User,
        as: 'RegisteredStudents',
        attributes: ['name', 'email'],
        through: { attributes: [] }
      }
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found or you are not authorized." });
    }
    const students = event.RegisteredStudents.map(student => ({
      Name: student.name,
      Email: student.email
    }));
    const csv = papaparse.unparse(students);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${event.title}-registrations.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Server error during export." });
  }
};
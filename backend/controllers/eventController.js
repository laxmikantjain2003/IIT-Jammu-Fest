const Event = require('../models/Event');
const User = require('../models/user'); // FIX: Standardizing to capital 'User'
const Registration = require('../models/Registration');
const papaparse = require('papaparse'); 
const sendEmail = require('../utils/sendEmail'); // ADDED: For event notifications
const { Op } = require('../database'); // ADDED: For database operations

/**
 * @description Create a new Event.
 * Also sends an email notification to ALL verified users.
 * (This function is unchanged from our last update)
 */
exports.createEvent = async (req, res) => {
  try {
    const { title, description, venue, eventDate, clubName } = req.body;
    const coordinatorId = req.user.id;
    
    // 1. Create the Event record
    const newEvent = await Event.create({
      title,
      description,
      venue,
      eventDate,
      clubName,
      coordinatorId
    });

    // --- Event Notification Feature ---
    // 2. Fetch all verified user emails
    const users = await User.findAll({
        where: { isVerified: true }, 
        attributes: ['email'],
    });

    // 3. Prepare the email list
    const recipientEmails = users.map(user => user.email).join(', ');
    
    // 4. Create the notification message
    const notificationMessage = `
      Hello IIT Jammu Community,

      A new event has been officially posted:

      Title: ${title}
      Club: ${clubName}
      Venue: ${venue}
      Date & Time: ${new Date(eventDate).toLocaleString()}

      Description: ${description}

      Visit the portal to register now!
      http://localhost:3000/events
    `;

    // 5. Send the email (runs in background)
    sendEmail({
        email: recipientEmails,
        subject: `[New Event Alert] ${clubName}: ${title}`,
        message: notificationMessage,
    }).catch(err => {
      console.error("Email notification failed to send:", err);
    });
    // --- End Notification Feature ---

    // 6. Send success response
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
 * (This function is unchanged)
 */
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['eventDate', 'ASC']],
      include: {
        model: User, // To show who created it
        attributes: ['name', 'email']
      }
    });
    res.status(200).json(events);
  } catch (error) {
    console.error("Get all events error:", error);
    res.status(500).json({ message: "Server error while fetching events." });
  }
};

/**
 * @description Register a Student OR Coordinator for an Event.
 * (UPDATED with coordinator self-registration check AND confirmation email)
 */
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id; // From 'protect' middleware

    // 1. Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // --- NEW SECURITY CHECK ---
    // 2. Check if the user is the coordinator of this specific event
    if (event.coordinatorId === userId) {
      return res.status(403).json({ 
        message: "You cannot register for an event that you are coordinating." 
      });
    }
    // --- END NEW CHECK ---

    // 3. Check if user is already registered
    const existingRegistration = await Registration.findOne({
      where: {
        userId: userId,
        eventId: eventId
      }
    });
    if (existingRegistration) {
      return res.status(400).json({ message: "You are already registered for this event." });
    }

    // 4. Create the registration
    await Registration.create({
      userId,
      eventId
    });

    // --- NEW CONFIRMATION EMAIL FEATURE ---
    // 5. Get the user's details for the email
    const user = await User.findByPk(userId, { attributes: ['name', 'email'] });

    const confirmationMessage = `
      Hello ${user.name},

      You have successfully registered for the following event:

      Event: ${event.title}
      Club: ${event.clubName}
      Date: ${new Date(event.eventDate).toLocaleString()}
      Venue: ${event.venue}

      We look forward to seeing you there!
      
      (This is a confirmation email, no reply is needed.)
    `;

    // 6. Send the confirmation email
    await sendEmail({
        email: user.email,
        subject: `Registration Confirmed: ${event.title}`,
        message: confirmationMessage,
    });
    // --- END CONFIRMATION EMAIL ---

    res.status(201).json({ message: "Registered for event successfully! A confirmation email has been sent." });

  } catch (error) {
    console.error("Event registration error:", error);
    res.status(500).json({ message: "Server error during event registration." });
  }
};

/**
 * @description Get all events created by the logged-in coordinator.
 * (This function is unchanged)
 */
exports.getMyEvents = async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const events = await Event.findAll({
      where: { coordinatorId: coordinatorId },
      order: [['eventDate', 'ASC']],
      include: {
        model: User,
        as: 'RegisteredStudents', // Use the alias from Registration.js
        attributes: ['name', 'email'],
        through: {
          attributes: [] // Don't include the join table data
        }
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
 * (This function is unchanged)
 */
exports.exportRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const coordinatorId = req.user.id;

    // 1. Find the event and ensure the coordinator owns it
    const event = await Event.findOne({
      where: { 
        id: eventId,
        coordinatorId: coordinatorId
      },
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

    // 2. Prepare the data for CSV
    const students = event.RegisteredStudents.map(student => ({
      Name: student.name,
      Email: student.email
    }));

    // 3. Convert JSON to CSV string
    const csv = papaparse.unparse(students);

    // 4. Send the CSV data as a downloadable file
    res.header('Content-Type', 'text/csv');
    res.attachment(`${event.title}-registrations.csv`);
    res.status(200).send(csv);

  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Server error during export." });
  }
};
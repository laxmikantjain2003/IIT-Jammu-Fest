const cron = require('node-cron');
const { Op } = require('../database'); // Op ko database.js se import karein
const Event = require('../models/Event');
const User = require('../models/user');
const Registration = require('../models/Registration');
const sendEmail = require('./sendEmail');

/**
 * @description Defines and starts the cron job for sending event reminders.
 */
const startReminderScheduler = () => {
  // Yeh task har ghante ke shuru mein chalega (e.g., 1:00, 2:00, 3:00)
  // cron syntax: (minute hour day-of-month month day-of-week)
  console.log('Initializing Event Reminder Scheduler to run every hour.');
  
  cron.schedule('0 * * * *', async () => {
    console.log('-------------------------------------------');
    console.log('Running Hourly Event Reminder Check...');
    
    try {
      const now = new Date();
      
      // Aise events dhoondhein jo:
      // 1. Ab se 4 ghante baad shuru honge
      const reminderWindowStart = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // 3 ghante baad
      // 2. Aur 5 ghante ke andar shuru honge
      const reminderWindowEnd = new Date(now.getTime() + (4 * 60 * 60 * 1000));   // 4 ghante baad
      // (Hum 3 aur 4 ghante ke beech ke events ko target kar rahe hain)

      const upcomingEvents = await Event.findAll({
        where: {
          eventDate: {
            [Op.between]: [reminderWindowStart, reminderWindowEnd]
          }
        },
        include: [
          {
            model: User,
            as: 'RegisteredStudents', // Registration.js se alias
            attributes: ['email', 'name'],
            through: { attributes: [] }
          }
        ]
      });

      if (upcomingEvents.length === 0) {
        console.log('No events found in the 3-4 hour reminder window.');
        console.log('-------------------------------------------');
        return;
      }

      console.log(`Found ${upcomingEvents.length} event(s) needing reminders.`);

      // Har event ke liye loop karein aur email bhejein
      for (const event of upcomingEvents) {
        if (event.RegisteredStudents && event.RegisteredStudents.length > 0) {
          
          const recipients = event.RegisteredStudents.map(user => user.email);
          const recipientList = recipients.join(', '); // Sabhi emails ki list

          const message = `
            Hi there,

            This is a reminder that the event you registered for is starting in about 4 hours!

            Event: ${event.title}
            Club: ${event.clubName}
            When: ${new Date(event.eventDate).toLocaleString()}
            Where: ${event.venue}

            We look forward to seeing you!
          `;

          // Sabhi registered users ko ek hi email (BCC ki tarah) bhejein
          await sendEmail({
            email: recipientList,
            subject: `[REMINDER] Event Starting Soon: ${event.title}`,
            message: message
          });
          
          console.log(`Sent reminders for "${event.title}" to ${recipients.length} users.`);
        }
      }
      console.log('-------------------------------------------');

    } catch (error) {
      console.error('Error in reminder scheduler:', error);
      console.log('-------------------------------------------');
    }
  });
};

module.exports = { startReminderScheduler };
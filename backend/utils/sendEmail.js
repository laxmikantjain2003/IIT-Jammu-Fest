const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * @description Sends an email notification using Nodemailer/Gmail SMTP.
 * @param {Object} options - Email options (email, subject, message).
 */
const sendEmail = async (options) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // Use false for port 587
    auth: {
      user: process.env.EMAIL_USER, // Sender's login email
      pass: process.env.EMAIL_PASS, // Sender's App Password
    },
  });

  // 2. Define the email options
  const mailOptions = {
    // Set a no-reply name and address for the sender
    from: `"${process.env.EMAIL_SENDER_NAME}" <noreply@iitfest.com>`, 
    replyTo: 'no-reply@iitfest.com', // Explicitly block replies
    to: options.email, // Recipient(s) email address (can be a comma-separated list)
    subject: options.subject,
    text: options.message,
  };

  // 3. Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    // Important: Throw an error so the calling controller function can catch it
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
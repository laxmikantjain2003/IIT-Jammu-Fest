/**
 * @file cloudinary.js
 * @description Configures and initializes the Cloudinary v2 SDK.
 * This file reads secret credentials from the .env file and exports a 
 * pre-configured Cloudinary instance for use in controllers.
 */

const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Loads variables from .env into process.env

// 1. Configure the Cloudinary instance with credentials from .env
// This single configuration step authenticates all future API calls
// (like upload, destroy, etc.)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Export the configured instance to be used by other files
module.exports = cloudinary;
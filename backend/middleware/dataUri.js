const DatauriParser = require('datauri/parser');
const path = require('path');
const parser = new DatauriParser();

/**
 * @description This function converts the buffer provided by Multer's memoryStorage 
 * into a base64 encoded data URI string that Cloudinary can understand.
 * @param {Object} file The file object from Multer
 * @returns {String} The data URI string
 */
exports.dataUri = (file) => {
  const extension = path.extname(file.originalname).toString();
  return parser.format(extension, file.buffer);
};
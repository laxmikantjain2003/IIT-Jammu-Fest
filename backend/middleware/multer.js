const multer = require('multer');
const DatauriParser = require('datauri/parser');
const path = require('path');

// 1. Multer setup: Store file in memory
const storage = multer.memoryStorage();
// --- FIX: Change 'logo' to 'file' to match the Photo Upload form ---
exports.multerUploads = multer({ storage }).single('file'); 

// 2. DatauriParser setup: Convert buffer to data URI string
const parser = new DatauriParser();

/**
 * @description Converts buffer to data URI string
 */
exports.dataUri = (file) => {
  const extension = path.extname(file.originalname).toString();
  return parser.format(extension, file.buffer);
};
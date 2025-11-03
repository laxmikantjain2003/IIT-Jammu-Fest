const multer = require('multer');

// Define the maximum file size (1MB) in bytes
const MAX_FILE_SIZE = 1 * 1024 * 1024; 
const storage = multer.memoryStorage();

// Handles 'file' field for Photo Gallery
exports.photoUpload = multer({ 
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE // Set max file size to 1MB
    },
    fileFilter: (req, file, cb) => {
        // Only allow image types
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
        }
    }
}).single('file'); // 'file' is the field name
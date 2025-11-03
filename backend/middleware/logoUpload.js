const multer = require('multer');
const storage = multer.memoryStorage();

// Handles 'logo' field for Club Create/Edit
exports.logoUpload = multer({ 
  storage: storage 
}).single('logo');
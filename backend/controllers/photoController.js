const Photo = require('../models/Photo');
const Club = require('../models/Club');
const cloudinary = require('../config/cloudinary');
const { dataUri } = require('../middleware/dataUri'); // Utility for image formatting

// --- Helper Functions for Image Upload ---
// We define these helpers again here, scoped to this controller.

/**
 * @description Uploads a file to Cloudinary.
 * @param {Object} file - The file object from Multer.
 * @param {String} folderName - The specific subfolder in Cloudinary.
 */
const uploadImage = async (file, folderName) => {
  if (!file) return null;
  const fileUri = dataUri(file).content;
  const result = await cloudinary.uploader.upload(fileUri, {
    folder: `iit-jammu-fest/${folderName}`,
  });
  return { url: result.secure_url, id: result.public_id };
};

/**
 * @description Deletes an image from Cloudinary using its public_id.
 * @param {String} publicId - The Cloudinary public_id of the image to delete.
 */
const deleteImage = async (publicId) => {
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};
// --- End Helper Functions ---


/**
 * @description Upload a new photo to a specific club's gallery.
 * @route POST /api/photos/:clubId
 */
exports.uploadPhoto = async (req, res) => {
    const { clubId } = req.params;
    const coordinatorId = req.user.id;
    const { caption } = req.body;
    let newPhoto = { url: null, id: null };
    
    try {
        // 1. Check if the club exists
        const club = await Club.findByPk(clubId);
        if (!club) {
            return res.status(404).json({ message: "Club not found." });
        }

        // 2. SECURITY CHECK: Ensure the user is the owner of this club
        if (club.coordinatorId !== coordinatorId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "You are not authorized to upload photos to this club." });
        }

        // 3. Handle Photo Upload
        if (!req.file) {
            return res.status(400).json({ message: "Please select a file to upload." });
        }
        
        newPhoto = await uploadImage(req.file, `club_gallery/${clubId}`);

        // 4. Save the Photo record in the database
        await Photo.create({
            clubId: clubId,
            imageUrl: newPhoto.url,
            cloudinaryId: newPhoto.id,
            caption: caption || `${club.name} Photo`
        });

        res.status(201).json({ 
            message: "Photo uploaded successfully!",
            imageUrl: newPhoto.url
        });

    } catch (error) {
        console.error("Photo upload error:", error);
        // Clean up Cloudinary if DB save fails
        await deleteImage(newPhoto.id); 
        res.status(500).json({ message: "Server error during photo upload." });
    }
};

/**
 * @description Get all photos for a specific club (Public).
 * @route GET /api/photos/:clubId
 */
exports.getClubPhotos = async (req, res) => {
    try {
        const photos = await Photo.findAll({
            where: { clubId: req.params.clubId },
            attributes: ['id', 'imageUrl', 'caption', 'createdAt'],
            order: [['createdAt', 'DESC']] // Show newest photos first
        });
        res.status(200).json(photos);
    } catch (error) {
        console.error("Get photos error:", error);
        res.status(500).json({ message: "Server error while fetching photos." });
    }
};

/**
 * @description Delete a photo from the club gallery.
 * @route DELETE /api/photos/delete/:photoId
 */
exports.deletePhoto = async (req, res) => {
    const { photoId } = req.params;
    const coordinatorId = req.user.id; // Logged-in user's ID
    
    try {
        // 1. Find the photo record
        const photo = await Photo.findByPk(photoId);
        if (!photo) {
            return res.status(404).json({ message: "Photo not found." });
        }

        // 2. Find the club to check ownership
        const club = await Club.findByPk(photo.clubId);
        
        // 3. SECURITY CHECK: Ensure the logged-in user is the club's owner
        if (!club || (club.coordinatorId !== coordinatorId && req.user.role !== 'admin')) {
            return res.status(403).json({ message: "You are not authorized to delete this photo." });
        }
        
        // 4. Delete photo from Cloudinary
        await deleteImage(photo.cloudinaryId);
        
        // 5. Delete photo record from the database
        await photo.destroy();

        res.status(200).json({ message: "Photo deleted successfully." });

    } catch (error) {
        console.error("Photo delete error:", error);
        res.status(500).json({ message: "Server error during photo deletion." });
    }
};
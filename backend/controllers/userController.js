const User = require('../models/user');
const Registration = require('../models/Registration'); // <-- NEW: Import Registration model
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const cloudinary = require('../config/cloudinary');
const { dataUri } = require('../middleware/dataUri'); // Utility for image formatting

// --- Helper Functions for Image Upload (Unchanged) ---
const uploadImage = async (file, folderName) => {
  if (!file) return null;
  const fileUri = dataUri(file).content;
  const result = await cloudinary.uploader.upload(fileUri, {
    folder: `iit-jammu-fest/${folderName}`, // Use the provided folder name
  });
  return { url: result.secure_url, id: result.public_id };
};
const deleteImage = async (publicId) => {
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};
// --- End Helper Functions ---


/**
 * @description Delete the authenticated user's account.
 * (Unchanged)
 */
exports.deleteMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    await deleteImage(user.profilePicCloudinaryId); 
    await user.destroy();
    res.status(200).json({ message: 'User account deleted successfully.' });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error while deleting account." });
  }
};

/**
 * @description Update the authenticated user's password.
 * (Unchanged)
 */
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both old and new passwords." });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect old password.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: 'Password updated successfully.' });

  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Server error while updating password." });
  }
};

/**
 * @description Upload or update the user's profile picture.
 * (Unchanged)
 */
exports.uploadProfilePic = async (req, res) => {
    const userId = req.user.id;
    let newPic = { url: null, id: null };
    
    try {
        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided.' });
        }
        if (user.profilePicCloudinaryId) {
            await deleteImage(user.profilePicCloudinaryId);
        }
        newPic = await uploadImage(req.file, `user_profiles/${userId.toString()}`);
        user.profilePicUrl = newPic.url;
        user.profilePicCloudinaryId = newPic.id;
        await user.save();
        const updatedUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicUrl: user.profilePicUrl 
        };
        
        res.status(200).json({ 
            message: 'Profile picture uploaded successfully.',
            user: updatedUser 
        });

    } catch (error) {
        console.error("Profile pic upload error:", error);
        await deleteImage(newPic.id); 
        res.status(500).json({ message: "Server error during profile picture update." });
    }
};

/**
 * @description Remove the user's profile picture.
 * (Unchanged - Small typo 'G' removed)
 */
exports.removeProfilePic = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }
        await deleteImage(user.profilePicCloudinaryId);
        user.profilePicUrl = null;
        user.profilePicCloudinaryId = null;
        await user.save(); 
        const updatedUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicUrl: null 
        };
        res.status(200).json({ 
            message: 'Profile picture removed successfully.',
            user: updatedUser 
        });
    } catch (error) {
        console.error("Profile pic remove error:", error);
        res.status(500).json({ message: "Server error during profile picture removal." });
    }
};

// --- NEW FUNCTION: Get Event IDs for the logged-in user ---
/**
 * @description Get all event IDs for which the user is registered.
 * @route GET /api/users/my-registrations
 */
exports.getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all registrations for this user
    const registrations = await Registration.findAll({
      where: { userId: userId },
      attributes: ['eventId'] // Only fetch the eventId column
    });
    
    // Convert array of objects [ {eventId: 1}, {eventId: 2} ] to a simple array of numbers [1, 2]
    const eventIds = registrations.map(reg => reg.eventId);

    res.status(200).json(eventIds);

  } catch (error) {
    console.error("Get my registrations error:", error);
    res.status(500).json({ message: "Server error while fetching registrations." });
  }
};
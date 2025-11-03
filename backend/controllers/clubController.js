const Club = require('../models/Club');
const User = require('../models/user'); // Needed to show coordinator info
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
 * @description Create a new Club.
 * @route POST /api/clubs
 */
exports.createClub = async (req, res) => {
  const { name, description } = req.body;
  const coordinatorId = req.user.id; // From the 'protect' middleware
  let clubLogo = { url: null, id: null };

  try {
    // 1. Check if the coordinator already owns a club
    const existingClub = await Club.findOne({ where: { coordinatorId: coordinatorId } });
    if (existingClub) {
      return res.status(400).json({ message: "You already own a club. Only one club per coordinator." });
    }

    // 2. Handle Logo Upload (if a file is provided in the 'logo' field)
    if (req.file) {
      clubLogo = await uploadImage(req.file, 'club_logos');
    }

    // 3. Create the Club record in the database
    const newClub = await Club.create({
      name,
      description,
      coordinatorId,
      logoUrl: clubLogo.url,
      logoCloudinaryId: clubLogo.id,
    });

    res.status(201).json({ 
      message: "Club created successfully!",
      club: newClub 
    });

  } catch (error) {
    console.error("Create club error:", error);
    // If club creation fails, delete the just-uploaded image from Cloudinary
    await deleteImage(clubLogo.id); 
    res.status(500).json({ message: "Server error during club creation." });
  }
};


/**
 * @description Update Club Details (name, description, logo).
 * @route PUT /api/clubs/:id
 */
exports.updateClub = async (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params; // Club ID from the URL
  const coordinatorId = req.user.id;
  let newClubLogo = { url: null, id: null };

  try {
    // 1. Find the existing club record
    const club = await Club.findByPk(id);
    if (!club) {
      return res.status(404).json({ message: "Club not found." });
    }

    // 2. SECURITY CHECK: Ensure the logged-in user is the club's owner
    if (club.coordinatorId !== coordinatorId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "You are not authorized to update this club." });
    }

    // 3. Handle NEW Logo Upload (if a file is provided)
    if (req.file) {
      // a. Delete the old logo from Cloudinary first
      await deleteImage(club.logoCloudinaryId);
      
      // b. Upload the new logo
      newClubLogo = await uploadImage(req.file, 'club_logos');
      club.logoUrl = newClubLogo.url;
      club.logoCloudinaryId = newClubLogo.id;
    }

    // 4. Update text fields
    club.name = name;
    club.description = description;

    // 5. Save the updated record
    await club.save();

    res.status(200).json({ 
      message: "Club updated successfully!",
      club: club
    });

  } catch (error) {
    console.error("Update club error:", error);
    // If a new image was uploaded but saving failed, clean up the new image
    await deleteImage(newClubLogo.id); 
    res.status(500).json({ message: "Server error during club update." });
  }
};

/**
 * @description Get all Clubs (Public).
 * Fetches a simple list for the main club directory.
 * @route GET /api/clubs
 */
exports.getAllClubs = async (req, res) => {
    try {
        const clubs = await Club.findAll({
            attributes: ['id', 'name', 'logoUrl', 'description'],
            order: [['name', 'ASC']], // Order clubs alphabetically
        });
        res.status(200).json(clubs);
    } catch (error) {
        console.error("Get all clubs error:", error);
        res.status(500).json({ message: "Server error while fetching clubs." });
    }
};

/**
 * @description Get details for one specific Club (Public).
 * Includes coordinator's name and email.
 * @route GET /api/clubs/:id
 */
exports.getClubDetails = async (req, res) => {
    try {
        const club = await Club.findByPk(req.params.id, {
            // Include the associated User (Coordinator) model
            include: {
                model: User,
                attributes: ['name', 'email'] // Only fetch public coordinator info
            }
        });

        if (!club) {
            return res.status(404).json({ message: "Club not found." });
        }
        res.status(200).json(club);
    } catch (error) {
        console.error("Get club details error:", error);
        res.status(500).json({ message: "Server error while fetching club details." });
    }
};
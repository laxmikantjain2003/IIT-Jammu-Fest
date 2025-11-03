const { DataTypes } = require('sequelize');
const { sequelize } = require('../database'); 
const Club = require('./Club'); 

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cloudinaryId: { // Public ID needed to delete the image from Cloudinary
    type: DataTypes.STRING,
    allowNull: false
  },
  caption: { // Optional description for the photo
    type: DataTypes.STRING,
    allowNull: true
  },
  // Link the photo to the Club
  clubId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clubs', 
      key: 'id'    
    },
    onDelete: 'CASCADE' // If the club is deleted, its photos are deleted too
  }
}, {
  tableName: 'club_photos' 
});

// Relationship: One Club can have many Photos
Club.hasMany(Photo, { foreignKey: 'clubId', onDelete: 'CASCADE' });
Photo.belongsTo(Club, { foreignKey: 'clubId' });

module.exports = Photo;
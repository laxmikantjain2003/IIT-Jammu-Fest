const { DataTypes } = require('sequelize');
const { sequelize } = require('../database'); 
const User = require('./user'); // To link the club to its coordinator

const Club = sequelize.define('Club', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Club names must be unique
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  logoCloudinaryId: { // To facilitate logo deletion on Cloudinary
    type: DataTypes.STRING,
    allowNull: true
  },
  // Link the club to its coordinator (User)
  coordinatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Use the actual table name
      key: 'id'    
    },
    onDelete: 'CASCADE' // If the coordinator is deleted, delete the club record
  }
}, {
  tableName: 'clubs' 
});

// Relationship: One User (Coordinator) can own one Club (for simplicity in this app)
User.hasOne(Club, { foreignKey: 'coordinatorId' });
Club.belongsTo(User, { foreignKey: 'coordinatorId' });

module.exports = Club;
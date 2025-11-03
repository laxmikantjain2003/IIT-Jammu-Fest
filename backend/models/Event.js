const { DataTypes } = require('sequelize');
const { sequelize } = require('../database'); 
const User = require('./user'); // To link the event to its coordinator

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eventDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  clubName: { // Storing the club name directly for display simplicity
    type: DataTypes.STRING,
    allowNull: false
  },
  // Link the event to the coordinator (User) who created it
  coordinatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'    
    },
    onDelete: 'CASCADE' 
  }
}, {
  tableName: 'events'
});

// Relationship: One User (Coordinator) can create many Events
User.hasMany(Event, { foreignKey: 'coordinatorId', onDelete: 'CASCADE' });
Event.belongsTo(User, { foreignKey: 'coordinatorId' });

module.exports = Event;
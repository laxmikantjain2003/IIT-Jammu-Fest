const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const User = require('./user');
const Event = require('./Event');

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // Link to the student (User) who registered
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users', // Actual table name
      key: 'id'
    },
    onDelete: 'CASCADE' // If user is deleted, registration is deleted
  },
  // Link to the event they registered for
  eventId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'events', // Actual table name
      key: 'id'
    },
    onDelete: 'CASCADE' // If event is deleted, registration is deleted
  }
}, {
  tableName: 'registrations',
  // Ensure a student can only register for an event ONCE
  indexes: [
    {
      unique: true,
      fields: ['userId', 'eventId']
    }
  ]
});

// --- Many-to-Many Relationship Setup ---
// These aliases are crucial for the Coordinator Dashboard
// This allows an Event to include all its Users (as 'RegisteredStudents')
// This allows a User to include all their Events (as 'RegisteredEvents')

User.belongsToMany(Event, { 
  through: Registration, 
  foreignKey: 'userId', 
  as: 'RegisteredEvents' 
});
Event.belongsToMany(User, { 
  through: Registration, 
  foreignKey: 'eventId', 
  as: 'RegisteredStudents' 
});

module.exports = Registration;
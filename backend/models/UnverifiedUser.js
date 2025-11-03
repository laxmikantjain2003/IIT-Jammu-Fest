const { DataTypes } = require('sequelize');
const { sequelize } = require('../database'); 

const UnverifiedUser = sequelize.define('UnverifiedUser', {
  // We only store essential data here until verification is complete
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true 
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  otpExpires: {
    type: DataTypes.DATE,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'unverified_users' 
});

module.exports = UnverifiedUser;
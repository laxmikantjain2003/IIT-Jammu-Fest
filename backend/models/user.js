const { DataTypes } = require('sequelize');
const { sequelize } = require('../database'); 

const User = sequelize.define('User', {
    // Basic Attributes
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'student'
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
  
    // --- Profile Picture Columns ---
    profilePicUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profilePicCloudinaryId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    
    // --- Verification Status and OTP Columns ---
    isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    otp: { // For email verification
        type: DataTypes.STRING,
        allowNull: true
    },
    otpExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // --- Password Reset Columns ---
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpire: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'users' 
});

module.exports = User;
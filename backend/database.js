const { Sequelize, Op } = require('sequelize');
require('dotenv').config();

// .env file se database connection details lena
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql', // Use MySQL dialect
    logging: false, // Prevents excessive query logging in console
  }
);

// Connection ko test karna
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database Connection has been established successfully. 🚀');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// sequelize object aur connectDB function ko export karna
module.exports = { sequelize, connectDB, Op };
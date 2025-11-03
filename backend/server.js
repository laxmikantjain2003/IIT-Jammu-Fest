const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Loads environment variables from .env file

// --- Database Connection ---
const { connectDB, sequelize } = require('./database');

// --- Import All Models ---
// These must be imported so Sequelize knows about them when syncing
const User = require('./models/user'); 
const UnverifiedUser = require('./models/UnverifiedUser');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const Club = require('./models/Club'); 
const Photo = require('./models/Photo'); 

// --- Import All Route Files ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const clubRoutes = require('./routes/clubRoutes');
const photoRoutes = require('./routes/photoRoutes'); 

// --- Create the Server ---
const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
// 1. Enable Cross-Origin Resource Sharing (allows frontend to talk to backend)
app.use(cors());
// 2. Set file size limits for JSON and URL-encoded data (for file uploads)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Database Connection & Sync ---
// 1. Test the connection
connectDB();
// 2. Synchronize all defined models with the database
// force: false ensures that tables are not dropped and re-created on every restart
sequelize.sync({ force: false }) 
  .then(() => {
    console.log('Database tables synchronized successfully. ✅');
  })
  .catch((err) => {
    console.error('Error synchronizing database tables:', err);
  });

// --- API Routes ---
// Connect the imported route files to their base URLs
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/photos', photoRoutes);

// --- Basic Test Route ---
app.get('/', (req, res) => {
  res.send('IIT Jammu Fest API is running!');
});

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
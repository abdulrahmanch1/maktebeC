require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Log environment variables for debugging
console.log('MONGO_URI is', process.env.MONGO_URI ? 'Loaded' : 'MISSING');
console.log('JWT_SECRET is', process.env.JWT_SECRET ? 'Loaded' : 'MISSING');
console.log('FRONTEND_URL is', process.env.FRONTEND_URL ? 'Loaded' : 'MISSING');

const app = express();

// Set Mongoose strictQuery to true
mongoose.set("strictQuery", true);

// Middleware
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');
const contactRoutes = require('./routes/contactRoutes');

// Use Routes
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/contact', contactRoutes);

// Basic Route for checking if API is up
app.get('/api', (req, res) => {
  res.send('API is running...');
});

// Connect to MongoDB
const DB_URI = process.env.MONGO_URI;

if (!DB_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined.");
} else {
    mongoose.connect(DB_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });
}

// Export the app for Vercel
module.exports = app;
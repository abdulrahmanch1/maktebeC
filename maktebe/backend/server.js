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
app.use(cors());
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

// Serve frontend build
app.use(express.static(path.join(__dirname, '../build')));

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
});

// Export the app for Vercel
module.exports = app;
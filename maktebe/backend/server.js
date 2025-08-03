require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
  res.send('API is running...');
});

app.get('/api/debug-env', (req, res) => {
  res.json({
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'Not Set',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set',
  });
});

// Connect to MongoDB (simplified for testing)
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

module.exports = app;
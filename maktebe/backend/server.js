require('dotenv').config();
const express = require('express');
const app = express();

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend test route is working!',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'Not Set',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set',
  });
});

module.exports = app;
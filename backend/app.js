require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set Mongoose strictQuery to true
mongoose.set("strictQuery", true);

// Middleware
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://192.168.1.31:3000'].filter(Boolean);

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

// Serve static files from the 'uploads' directory and set CORP header
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Import Routes
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');
const contactRoutes = require('./routes/contactRoutes');

// Use Routes
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/contact', contactRoutes);

// Basic Route
app.get('/api', (req, res) => {
  res.send('API is running...');
});

// Handle 404 - Not Found
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// General Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Connect to MongoDB
const DB_URI = process.env.MONGO_URI;

if (DB_URI) {
  mongoose.connect(DB_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
} else {
  console.error('MONGO_URI not defined in environment variables.');
}

module.exports = app;

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Add path module
const fs = require('fs'); // Add fs module

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set Mongoose strictQuery to true
mongoose.set("strictQuery", true);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow requests from your frontend or specified URL
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');

// Use Routes
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);

// Basic Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Handle 404 - Not Found
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// General Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).send('Something broke!');
});

// Connect to MongoDB
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/maktebe';

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET not defined in environment variables. Exiting...");
  process.exit(1); // Stop the server if JWT_SECRET is not defined
}

mongoose.connect(DB_URI, {})
.then(() => console.log('MongoDB Connected...'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit process on connection failure
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

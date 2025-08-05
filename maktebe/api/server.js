const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

console.log('Server: Starting server.js execution...');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 5000;

console.log(`Server: PORT is ${PORT}`);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Server: Created uploads directory.');
}

// Mongoose config
mongoose.set('strictQuery', true);
console.log('Server: Mongoose strictQuery set.');

// Middleware
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://192.168.1.31:3000'].filter(Boolean);
console.log('Server: Allowed origins configured.');

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
console.log('Server: Express middleware configured.');

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
console.log('Server: Static files serving configured.');

// Routes
const booksRouter = require('../backend/routes/books');
const usersRouter = require('../backend/routes/users');
const contactRoutes = require('../backend/routes/contactRoutes');

app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/contact', contactRoutes);
console.log('Server: API routes mounted.');

// Status check
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
  console.log('Server: Status check route hit.');
});

// Root
app.get('/', (req, res) => {
  res.send('API is running...');
  console.log('Server: Root route hit.');
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
  console.log(`Server: 404 - Route not found: ${req.originalUrl}`);
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server: Global error handler caught an error:', err.stack);
  res.status(500).send('Something broke!');
});

// MongoDB Connection
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/maktebe';
console.log(`Server: Attempting to connect to MongoDB with URI: ${DB_URI}`);

if (!process.env.JWT_SECRET) {
  console.error('Server: ❌ JWT_SECRET not defined in environment variables. Exiting...');
  process.exit(1);
}

mongoose.connect(DB_URI)
  .then(() => console.log('Server: MongoDB Connected successfully!'))
  .catch(err => {
    console.error('Server: MongoDB connection error:', err);
    process.exit(1);
  });

app.listen(PORT, () => console.log(`Server: Server running on port ${PORT}`));

console.log('Server: End of server.js execution.');

module.exports = app;
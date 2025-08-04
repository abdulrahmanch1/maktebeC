require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Mongoose config
mongoose.set('strictQuery', true);

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

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');
const contactRoutes = require('./routes/contactRoutes');

app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/contact', contactRoutes);

// Status check
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Root
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// MongoDB Connection
const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/maktebe';

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET not defined in environment variables. Exiting...');
  process.exit(1);
}

mongoose.connect(DB_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

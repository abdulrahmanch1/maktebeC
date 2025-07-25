const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Placeholder for JWT Secret - MUST be loaded from environment variables in production
const JWT_SECRET = process.env.JWT_SECRET; 

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with that email already exists' });
    }

    const user = new User({
      username,
      email,
      password,
    });

    const newUser = await user.save();

    if (newUser) {
      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        token: generateToken(newUser._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err) {
    console.error("Error during registration:", err); // More detailed error logging
    res.status(500).json({ message: err.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select('+password'); 

    if (user && (await user.matchPassword(password))) {
      res.json({
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          favorites: user.favorites, // Include favorites
          readingList: user.readingList, // Include readingList
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error("Error during login:", err); // More detailed error logging
    res.status(500).json({ message: err.message });
  }
});

// Get all users (for admin purposes, or remove if not needed)
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single user (protected)
router.get('/:id', protect, async (req, res) => {
  try {
    // req.user is set by the protect middleware
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a user (protected)
router.patch('/:id', protect, async (req, res) => {
  try {
    // req.user is set by the protect middleware
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.username != null) user.username = req.body.username;
    if (req.body.email != null) user.email = req.body.email;
    if (req.body.password != null) user.password = req.body.password; // Password will be hashed by pre-save hook
    if (req.body.favorites != null) user.favorites = req.body.favorites;
    if (req.body.readingList != null) user.readingList = req.body.readingList;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a user (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    // req.user is set by the protect middleware
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Add a book to user's favorites (protected)
router.post('/:userId/favorites', protect, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { bookId } = req.body;

    // Ensure the user is trying to modify their own favorites
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify these favorites' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.favorites.includes(bookId)) {
      user.favorites.push(bookId);
      await user.save();
    }
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove a book from user's favorites (protected)
router.delete('/:userId/favorites/:bookId', protect, async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookId = req.params.bookId;

    // Ensure the user is trying to modify their own favorites
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify these favorites' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favorites = user.favorites.filter(favId => favId.toString() !== bookId);
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


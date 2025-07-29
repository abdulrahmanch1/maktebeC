const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto'); // Import crypto for token generation
const nodemailer = require('nodemailer'); // Import nodemailer
const {
  registerValidationRules,
  loginValidationRules,
  handleValidationErrors,
  userUpdateValidationRules,
  favoriteValidationRules,
  readingListValidationRules,
  readingStatusValidationRules,
  paramBookIdValidationRules
} = require('../middleware/validationMiddleware');

// Multer setup for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // Destination folder for uploads
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Get the original extension
    cb(null, Date.now() + '-profile' + ext); // Use timestamp + '-profile' + original extension
  },
});
const upload = multer({ storage: storage });

// Placeholder for JWT Secret - MUST be loaded from environment variables in production
const JWT_SECRET = process.env.JWT_SECRET; 

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like Outlook, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
}); 

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' }); // Token expires in 30 days
};

// Register a new user
router.post('/register', registerValidationRules(), handleValidationErrors, async (req, res) => {
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
      verificationToken: crypto.randomBytes(20).toString('hex'),
      verificationTokenExpires: Date.now() + 3600000, // 1 hour
    });

    const newUser = await user.save();

    // Send verification email
    const verificationUrl = `${process.env.REACT_APP_API_URL}/api/users/verify-email/${newUser.verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: 'تأكيد حسابك في مكتبة الكتب',
      html: `<p>مرحباً ${newUser.username},</p>
             <p>يرجى النقر على الرابط التالي لتأكيد حسابك في مكتبة الكتب:</p>
             <p><a href="${verificationUrl}">${verificationUrl}</a></p>
             <p>هذا الرابط صالح لمدة ساعة واحدة.</p>
             <p>شكراً لك!</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending verification email:", error);
      } else {
        console.log("Verification email sent:", info.response);
      }
    });

    if (newUser) {
      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err) {
    console.error("Error during registration:", err);
    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyValue)[0];
      const message = `هذا الـ ${field === 'email' ? 'البريد الإلكتروني' : 'اسم المستخدم'} موجود بالفعل.`;
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: err.message });
  }
});

// User login
router.post('/login', loginValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select('+password'); 

    if (!user) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.' });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role, // Include user role
          favorites: user.favorites, // Include favorites
          readingList: user.readingList, // Include readingList
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
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
    const user = await User.findById(req.params.id).select('-password'); // Ensure password is not sent
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a user (protected)
router.patch('/:id', protect, userUpdateValidationRules(), handleValidationErrors, async (req, res) => {
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

// Update user profile picture (protected)
router.patch('/:id/profile-picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.file) {
      user.profilePicture = req.file.filename;
    }

    const updatedUser = await user.save();
    res.json({ profilePicture: updatedUser.profilePicture });
  } catch (err) {
    console.error("Error updating profile picture:", err);
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
router.post('/:userId/favorites', protect, favoriteValidationRules(), handleValidationErrors, async (req, res) => {
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

    // Add book to favorites if it's not already there
    if (!user.favorites.includes(bookId)) {
      user.favorites.push(bookId);
      await user.save();
    }

    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove a book from user's favorites (protected)
router.delete('/:userId/favorites/:bookId', protect, paramBookIdValidationRules(), handleValidationErrors, async (req, res) => {
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

    // Remove book from favorites
    user.favorites = user.favorites.filter(id => id.toString() !== bookId);
    await user.save();

    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Add a book to user's reading list (protected)
router.post('/:userId/reading-list', protect, readingListValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { bookId } = req.body;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this reading list' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if book is already in reading list
    const bookExists = user.readingList.some(item => item.book.toString() === bookId);
    if (bookExists) {
      return res.status(400).json({ message: 'Book already in reading list' });
    }

    user.readingList.push({ book: bookId, read: false });
    await user.save();
    res.status(201).json(user.readingList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update book read status in reading list (protected)
router.patch('/:userId/reading-list/:bookId', protect, readingStatusValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookId = req.params.bookId;
    const { read } = req.body;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this reading list' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const readingListItem = user.readingList.find(item => item.book.toString() === bookId);
    if (!readingListItem) {
      return res.status(404).json({ message: 'Book not found in reading list' });
    }

    readingListItem.read = read;
    await user.save();
    res.json(user.readingList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove a book from user's reading list (protected)
router.delete('/:userId/reading-list/:bookId', protect, paramBookIdValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookId = req.params.bookId;

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this reading list' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.readingList = user.readingList.filter(item => item.book.toString() !== bookId);
    await user.save();
    res.json(user.readingList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'رمز التحقق غير صالح أو انتهت صلاحيته.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'تم تأكيد بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.' });
  } catch (err) {
    console.error("Error verifying email:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


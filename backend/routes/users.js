const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { registerValidationRules, loginValidationRules, handleValidationErrors, userUpdateValidationRules } = require('../middleware/validationMiddleware');

// Multer setup remains the same
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-profile' + ext);
  },
});
const upload = multer({ storage: storage });

const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Register a new user
router.post('/register', registerValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User with that email already exists' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    const newUser = await User.create({
      username,
      email,
      password,
      verificationToken,
      verificationTokenExpires,
    });

    const verificationUrl = `${process.env.REACT_APP_API_URL}/api/users/verify-email/${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: 'تأكيد حسابك في دار القرَاء',
      html: `<p>مرحباً ${newUser.username},</p><p>يرجى النقر على الرابط التالي لتأكيد حسابك في دار القرَاء:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>هذا الرابط صالح لمدة ساعة واحدة.</p><p>شكراً لك!</p>`,
    };

    transporter.sendMail(mailOptions);

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User login
router.post('/login', loginValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user.id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single user
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a user
router.patch('/:id', protect, userUpdateValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    if (req.params.id !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    const user = await User.findByPk(req.params.id);
    if (user) {
      const { username, email, password } = req.body;
      await user.update({ username, email, password });
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user profile picture
router.patch('/:id/profile-picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    if (req.params.id !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    const user = await User.findByPk(req.params.id);
    if (user) {
      if (req.file) {
        await user.update({ profilePicture: req.file.filename });
      }
      res.json({ profilePicture: user.profilePicture });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a user
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.params.id !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json({ message: 'User deleted' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({ where: { verificationToken: req.params.token } });
    if (!user) {
      return res.status(400).json({ message: 'رمز التحقق غير صالح أو انتهت صلاحيته.' });
    }
    await user.update({ isVerified: true, verificationToken: null, verificationTokenExpires: null });
    res.status(200).json({ message: 'تم تأكيد بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
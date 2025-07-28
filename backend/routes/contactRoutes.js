const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { protect, admin } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Validation rules for contact message
const contactMessageValidationRules = () => {
  return [
    body('subject').notEmpty().withMessage('الموضوع مطلوب.'),
    body('message').notEmpty().withMessage('الرسالة مطلوبة.'),
    body('email').isEmail().withMessage('البريد الإلكتروني غير صالح.'),
    body('username').optional().notEmpty().withMessage('اسم المستخدم لا يمكن أن يكون فارغًا.'),
  ];
};

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// POST a new contact message
router.post('/', contactMessageValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const { subject, message, email, username } = req.body;

    const newContactMessage = new ContactMessage({
      subject,
      message,
      email,
      username: username || 'Guest',
      user: req.user ? req.user._id : null, // Associate with user if logged in
    });

    await newContactMessage.save();
    res.status(201).json({ message: 'تم إرسال رسالتك بنجاح!' });
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ message: 'فشل إرسال الرسالة.' });
  }
});

// GET all contact messages (Admin only)
router.get('/messages', protect, admin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().populate('user', 'username email').sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ message: 'فشل جلب الرسائل.' });
  }
});

module.exports = router;
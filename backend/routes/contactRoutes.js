const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { protect, admin } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

const contactMessageValidationRules = () => {
  return [
    body('subject').notEmpty().withMessage('الموضوع مطلوب.'),
    body('message').notEmpty().withMessage('الرسالة مطلوبة.'),
    body('email').isEmail().withMessage('البريد الإلكتروني غير صالح.'),
    body('username').optional().notEmpty().withMessage('اسم المستخدم لا يمكن أن يكون فارغًا.'),
  ];
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/', protect, contactMessageValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const { subject, message, email, username } = req.body;
    const newContactMessage = await ContactMessage.create({
      subject,
      message,
      email,
      username: username || 'Guest',
      UserId: req.user ? req.user.id : null,
    });
    res.status(201).json({ message: 'تم إرسال رسالتك بنجاح!' });
  } catch (error) {
    res.status(500).json({ message: 'فشل إرسال الرسالة.' });
  }
});

router.get('/messages', protect, admin, async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'فشل جلب الرسائل.' });
  }
});

router.delete('/messages/:id', protect, admin, async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    if (message) {
      await message.destroy();
      res.json({ message: 'تم حذف الرسالة بنجاح!' });
    } else {
      res.status(404).json({ message: 'الرسالة غير موجودة.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'فشل حذف الرسالة.' });
  }
});

module.exports = router;

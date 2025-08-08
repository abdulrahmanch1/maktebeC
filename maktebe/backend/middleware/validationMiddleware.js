const { body, validationResult, param } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidationRules = () => {
  return [
    body('username').notEmpty().withMessage('اسم المستخدم مطلوب.'),
    body('email').isEmail().withMessage('البريد الإلكتروني غير صالح.'),
    body('password').isLength({ min: 6 }).withMessage('يجب أن تكون كلمة المرور 6 أحرف على الأقل.')
  ];
};

const loginValidationRules = () => {
  return [
    body('email').isEmail().withMessage('البريد الإلكتروني غير صالح.'),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة.')
  ];
};

const bookValidationRules = () => {
  return [
    body('title').notEmpty().withMessage('العنوان مطلوب.'),
    body('author').notEmpty().withMessage('المؤلف مطلوب.'),
    body('category').notEmpty().withMessage('التصنيف مطلوب.'),
    body('description').notEmpty().withMessage('الوصف مطلوب.'),
    body('pages').isNumeric().withMessage('عدد الصفحات يجب أن يكون رقمًا.'),
    body('publishYear').isNumeric().withMessage('سنة النشر يجب أن تكون رقمًا.'),
    body('language').notEmpty().withMessage('اللغة مطلوبة.')
  ];
};

const commentValidationRules = () => {
  return [
    body('text').notEmpty().withMessage('نص التعليق لا يمكن أن يكون فارغًا.')
  ];
};

const userUpdateValidationRules = () => {
  return [
    body('username').optional().notEmpty().withMessage('اسم المستخدم لا يمكن أن يكون فارغًا.'),
    body('email').optional().isEmail().withMessage('البريد الإلكتروني غير صالح.'),
    body('password').optional().isLength({ min: 6 }).withMessage('يجب أن تكون كلمة المرور 6 أحرف على الأقل.')
  ];
};

const favoriteValidationRules = () => {
  return [
    body('bookId').isMongoId().withMessage('معرف الكتاب غير صالح.')
  ];
};

const paramBookIdValidationRules = () => {
  return [
    param('bookId').isMongoId().withMessage('معرف الكتاب في المسار غير صالح.')
  ];
};

const readingListValidationRules = () => {
  return [
    body('bookId').isMongoId().withMessage('معرف الكتاب غير صالح.')
  ];
};

const readingStatusValidationRules = () => {
  return [
    body('read').isBoolean().withMessage('حالة القراءة يجب أن تكون قيمة منطقية (true/false).')
  ];
};

module.exports = {
  handleValidationErrors,
  registerValidationRules,
  loginValidationRules,
  bookValidationRules,
  commentValidationRules,
  userUpdateValidationRules,
  favoriteValidationRules,
  readingListValidationRules,
  readingStatusValidationRules,
  paramBookIdValidationRules
};

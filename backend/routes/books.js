const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');
const { bookValidationRules, handleValidationErrors } = require('../middleware/validationMiddleware');
const { Op } = require('sequelize');

// Multer setup remains the same
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage: storage });

// Get all books
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let where = {};
    if (search) {
      where = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { author: { [Op.iLike]: `%${search}%` } },
          { category: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }
    const books = await Book.findAll({ where });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new book
router.post('/', protect, admin, upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdfFile', maxCount: 1 }]), bookValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const { title, author, category, description, pages, publishYear, language, keywords } = req.body;
    const newBook = await Book.create({
      title,
      author,
      category,
      description,
      pages,
      publishYear,
      language,
      cover: req.files && req.files.cover ? req.files.cover[0].filename : '',
      pdfFile: req.files && req.files.pdfFile ? req.files.pdfFile[0].filename : '',
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
    });
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a book
router.patch('/:id', protect, admin, upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdfFile', maxCount: 1 }]), bookValidationRules(), handleValidationErrors, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      const { title, author, category, description, pages, publishYear, language, keywords } = req.body;
      await book.update({
        title,
        author,
        category,
        description,
        pages,
        publishYear,
        language,
        cover: req.files && req.files.cover ? req.files.cover[0].filename : book.cover,
        pdfFile: req.files && req.files.pdfFile ? req.files.pdfFile[0].filename : book.pdfFile,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : book.keywords,
      });
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a book
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.json({ message: 'Book deleted' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Comment and like routes are removed as they are not directly supported by the new schema

module.exports = router;
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const multer = require('multer'); // Add multer
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware'); // Import auth middleware
const User = require('../models/User'); // Import User model
const cloudinary = require('cloudinary').v2; // Import Cloudinary

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for file uploads (using memory storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'cover') {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed for cover!'), false);
      }
    } else if (file.fieldname === 'pdfFile') {
      if (!file.originalname.match(/\.(pdf)$/)) {
        return cb(new Error('Only PDF files are allowed for pdfFile!'), false);
      }
    }
    cb(null, true);
  }
});

// Middleware to get book by ID
async function getBook(req, res, next) {
  let book;
  try {
    book = await Book.findById(req.params.id);
    if (book == null) {
      return res.status(404).json({ message: 'Cannot find book' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.book = book;
  next();
}

// Get all books
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { keywords: { $regex: search, $options: 'i' } }, // Search in keywords
        ],
      };
    }

    const books = await Book.find(query);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one book
router.get('/:id', getBook, async (req, res) => {
  try {
    const book = res.book;
    // Calculate how many users have read this book
    const readCount = await User.countDocuments({ "readingList.book": book._id, "readingList.read": true });

    // Calculate how many users have favorited this book
    const favoriteCount = await User.countDocuments({ favorites: book._id });

    // Add these counts to the book object
    const bookObject = book.toObject();
    bookObject.readCount = readCount;
    bookObject.favoriteCount = favoriteCount;

    res.json(bookObject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new book
router.post(
  '/',
  protect,
  admin,
  upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdfFile', maxCount: 1 }]),
  bookValidationRules(),
  handleValidationErrors,
  async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    category: req.body.category,
    description: req.body.description,
    cover: req.files && req.files.cover ? (await cloudinary.uploader.upload(`data:${req.files.cover[0].mimetype};base64,${req.files.cover[0].buffer.toString('base64')}`, { folder: 'book_covers' })).secure_url : '',
    pdfFile: req.files && req.files.pdfFile ? (await cloudinary.uploader.upload(`data:${req.files.pdfFile[0].mimetype};base64,${req.files.pdfFile[0].buffer.toString('base64')}`, { folder: 'book_pdfs', resource_type: 'raw' })).secure_url : '',
    pages: req.body.pages,
    publishYear: req.body.publishYear,
    language: req.body.language,
    keywords: req.body.keywords ? req.body.keywords.split(',').map(keyword => keyword.trim()) : [], // Process keywords
  });

  try {
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a book
router.patch(
  '/:id',
  protect,
  admin,
  getBook,
  upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdfFile', maxCount: 1 }]),
  bookValidationRules(),
  handleValidationErrors,
  async (req, res) => {
  if (req.body.title != null) res.book.title = req.body.title;
  if (req.body.author != null) res.book.author = req.body.author;
  if (req.body.category != null) res.book.category = req.body.category;
  if (req.body.description != null) res.book.description = req.body.description;

  if (req.files && req.files.cover) {
    const result = await cloudinary.uploader.upload(`data:${req.files.cover[0].mimetype};base64,${req.files.cover[0].buffer.toString('base64')}`, { folder: 'book_covers' });
    res.book.cover = result.secure_url;
  } else if (req.body.cover != null) {
    res.book.cover = req.body.cover;
  }

  if (req.files && req.files.pdfFile) {
    const result = await cloudinary.uploader.upload(`data:${req.files.pdfFile[0].mimetype};base64,${req.files.pdfFile[0].buffer.toString('base64')}`, { folder: 'book_pdfs', resource_type: 'raw' });
    res.book.pdfFile = result.secure_url;
  } else if (req.body.pdfFile != null) {
    res.book.pdfFile = req.body.pdfFile;
  }

  if (req.body.pages != null) res.book.pages = req.body.pages;
  if (req.body.publishYear != null) res.book.publishYear = req.body.publishYear;
  if (req.body.language != null) res.book.language = req.body.language;
  if (req.body.keywords != null) res.book.keywords = req.body.keywords.split(',').map(keyword => keyword.trim()); // Process keywords

  try {
    const updatedBook = await res.book.save();
    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a book
router.delete('/:id', protect, admin, getBook, async (req, res) => {
  try {
    await res.book.deleteOne();
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a comment to a book
router.post(
  '/:id/comments',
  protect,
  getBook,
  commentValidationRules(),
  handleValidationErrors,
  async (req, res) => {
  const { text } = req.body;
  const book = res.book;

  if (!text) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  try {
    const newComment = {
      user: req.user._id,
      username: req.user.username, // Use username from authenticated user
      profilePicture: req.user.profilePicture || 'user.jpg', // Default if not set
      text,
    };

    book.comments.push(newComment);
    await book.save();

    // Get the newly added comment with its _id
    const addedComment = book.comments[book.comments.length - 1];

    res.status(201).json(addedComment);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete a comment from a book
router.delete('/:bookId/comments/:commentId', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const commentId = req.params.commentId;
    const commentIndex = book.comments.findIndex(comment => comment._id.toString() === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const commentToDelete = book.comments[commentIndex];

    // Check if the user is the comment author or an admin
    if (req.user._id.toString() !== commentToDelete.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    book.comments.splice(commentIndex, 1);
    await book.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: err.message });
  }
});

// Toggle like on a comment
router.post('/:bookId/comments/:commentId/like', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const commentId = req.params.commentId;
    const comment = book.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user._id;
    const userLikedIndex = comment.likes.findIndex(id => id.toString() === userId.toString());

    if (userLikedIndex === -1) {
      // User has not liked, so add like
      comment.likes.push(userId);
    } else {
      // User has liked, so remove like
      comment.likes.splice(userLikedIndex, 1);
    }

    await book.save();

    res.json({ likes: comment.likes.length, liked: userLikedIndex === -1 });
  } catch (err) {
    console.error("Error toggling like:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

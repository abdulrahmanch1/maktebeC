const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');

jest.mock('../middleware/authMiddleware', () => ({
  protect: jest.fn(),
  admin: jest.fn(),
}));

const { protect, admin } = require('../middleware/authMiddleware');
const booksRouter = require('../routes/books');

const app = express();
app.use(express.json());
app.use('/api/books', booksRouter);

const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/maktebe-test';

beforeAll(async () => {
  await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  await Book.deleteMany({});
  await User.deleteMany({});
});

beforeEach(() => {
  protect.mockImplementation((req, res, next) => {
    req.user = { _id: '60f7e1b3b3f3b3b3b3b3b3b3', username: 'testuser', role: 'user' }; // Default user for protected routes
    next();
  });
  admin.mockImplementation((req, res, next) => {
    req.user = { _id: '60f7e1b3b3f3b3b3b3b3b3b4', username: 'adminuser', role: 'admin' }; // Default admin for admin routes
    next();
  });
});

describe('Book Routes', () => {
  it('should get all books', async () => {
    await Book.create({ title: 'Book 1', author: 'Author 1', category: 'Category 1', description: 'Description 1', pages: 100, publishYear: 2021, language: 'Arabic', cover: 'cover.jpg' });
    await Book.create({ title: 'Book 2', author: 'Author 2', category: 'Category 2', description: 'Description 2', pages: 200, publishYear: 2022, language: 'English', cover: 'cover.jpg' });

    const res = await request(app).get('/api/books');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
  });

  it('should add a new book', async () => {
    const res = await request(app)
      .post('/api/books')
      .field('title', 'New Book')
      .field('author', 'New Author')
      .field('category', 'New Category')
      .field('description', 'New Description')
      .field('pages', 150)
      .field('publishYear', 2023)
      .field('language', 'French')
      .attach('cover', Buffer.from('test cover'), 'cover.jpg')
      .attach('pdfFile', Buffer.from('test pdf'), 'book.pdf');

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'New Book');
  });

  it('should add a comment to a book', async () => {
    const book = await Book.create({ title: 'Book 1', author: 'Author 1', category: 'Category 1', description: 'Description 1', pages: 100, publishYear: 2021, language: 'Arabic', cover: 'cover.jpg' });

    const res = await request(app)
      .post(`/api/books/${book._id}/comments`)
      .send({ text: 'This is a great book!', username: 'testuser' });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('text', 'This is a great book!');
  });

  it('should update a book', async () => {
    const book = await Book.create({ title: 'Old Title', author: 'Old Author', category: 'Old Category', description: 'Old Description', pages: 100, publishYear: 2020, language: 'English', cover: 'old_cover.jpg' });

    const res = await request(app)
      .patch(`/api/books/${book._id}`)
      .field('title', 'Updated Title')
      .field('author', 'Updated Author')
      .field('category', 'Updated Category')
      .field('description', 'Updated Description')
      .field('pages', 150)
      .field('publishYear', 2021)
      .field('language', 'French');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'Updated Title');
  });

  it('should delete a book', async () => {
    const book = await Book.create({ title: 'Book to Delete', author: 'Author', category: 'Category', description: 'Description', pages: 100, publishYear: 2020, language: 'English', cover: 'cover.jpg' });

    const res = await request(app).delete(`/api/books/${book._id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Book deleted');

    const deletedBook = await Book.findById(book._id);
    expect(deletedBook).toBeNull();
  });

  it('should not allow non-admin to add a book', async () => {
    // Mock protect to return a non-admin user
    protect.mockImplementationOnce((req, res, next) => {
      req.user = { _id: '60f7e1b3b3f3b3b3b3b3b3b3', username: 'testuser', role: 'user' };
      next();
    });
    admin.mockImplementationOnce((req, res, next) => {
      res.status(403).json({ message: 'Not authorized as an admin' });
    });

    const res = await request(app)
      .post('/api/books')
      .field('title', 'Unauthorized Book')
      .field('author', 'Author')
      .field('category', 'Category')
      .field('description', 'Description')
      .field('pages', 100)
      .field('publishYear', 2020)
      .field('language', 'English')
      .attach('cover', Buffer.from('test cover'), 'cover.jpg');

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Not authorized as an admin');
  });

  it('should not allow non-admin to update a book', async () => {
    const book = await Book.create({ title: 'Book to Update', author: 'Author', category: 'Category', description: 'Description', pages: 100, publishYear: 2020, language: 'English', cover: 'cover.jpg' });

    // Mock protect to return a non-admin user
    protect.mockImplementationOnce((req, res, next) => {
      req.user = { _id: '60f7e1b3b3f3b3b3b3b3b3b3', username: 'testuser', role: 'user' };
      next();
    });
    admin.mockImplementationOnce((req, res, next) => {
      res.status(403).json({ message: 'Not authorized as an admin' });
    });

    const res = await request(app)
      .patch(`/api/books/${book._id}`)
      .field('title', 'Attempted Update');

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Not authorized as an admin');
  });

  it('should not allow non-admin to delete a book', async () => {
    const book = await Book.create({ title: 'Book to Delete', author: 'Author', category: 'Category', description: 'Description', pages: 100, publishYear: 2020, language: 'English', cover: 'cover.jpg' });

    // Mock protect to return a non-admin user
    protect.mockImplementationOnce((req, res, next) => {
      req.user = { _id: '60f7e1b3b3f3b3b3b3b3b3b3', username: 'testuser', role: 'user' };
      next();
    });
    admin.mockImplementationOnce((req, res, next) => {
      res.status(403).json({ message: 'Not authorized as an admin' });
    });

    const res = await request(app).delete(`/api/books/${book._id}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Not authorized as an admin');
  });
});

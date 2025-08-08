const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const usersRouter = require('../routes/users');
const User = require('../models/User');

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/maktebe-test';

beforeAll(async () => {
  await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.');
  });

  it('should not register a user with an existing email', async () => {
    await new User({ username: 'testuser', email: 'test@example.com', password: 'password123' }).save();

    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'User with that email already exists');
  });

  it('should login a verified user', async () => {
    const user = new User({ username: 'testuser', email: 'test@example.com', password: 'password123', isVerified: true });
    await user.save();

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login an unverified user', async () => {
    await new User({ username: 'testuser', email: 'test@example.com', password: 'password123' }).save();

    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.');
  });
});

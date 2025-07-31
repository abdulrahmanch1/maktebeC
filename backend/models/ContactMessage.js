const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Optional: if user is logged in
  email: { type: String, required: true },
  username: { type: String, default: 'Guest' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
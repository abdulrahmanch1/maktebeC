const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  cover: { type: String, required: true },
  pages: { type: Number, required: true },
  publishYear: { type: Number, required: true },
  language: { type: String, required: true },
  pdfFile: { type: String }, // Add this line for PDF file path
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      username: { type: String, required: true },
      profilePicture: { type: String },
      text: { type: String, required: true },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Add likes array
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Book', bookSchema);

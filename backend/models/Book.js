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
});

module.exports = mongoose.model('Book', bookSchema);
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  cover: { type: DataTypes.STRING, allowNull: false },
  pages: { type: DataTypes.INTEGER, allowNull: false },
  publishYear: { type: DataTypes.INTEGER, allowNull: false },
  language: { type: DataTypes.STRING, allowNull: false },
  pdfFile: { type: DataTypes.STRING },
  keywords: { type: DataTypes.ARRAY(DataTypes.STRING) },
});

module.exports = Book;
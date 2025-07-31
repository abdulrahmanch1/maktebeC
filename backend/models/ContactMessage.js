const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
  subject: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, defaultValue: 'Guest' },
});

module.exports = ContactMessage;

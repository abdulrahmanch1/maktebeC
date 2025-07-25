const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // Prevent password from being returned in API responses
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  readingList: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
      read: { type: Boolean, default: false },
    },
  ],
  profilePicture: { type: String, default: 'user_avatar.png' }, // Add this line for profile picture
});

// Hash password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

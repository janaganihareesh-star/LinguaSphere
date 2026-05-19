const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    minLength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default in queries
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Instance method to match entered password with hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

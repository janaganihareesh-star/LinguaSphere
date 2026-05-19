const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inputText: {
    type: String,
    required: true
  },
  translatedText: {
    type: String,
    required: true
  },
  sourceLanguage: {
    type: String,
    required: true
  },
  targetLanguage: {
    type: String,
    required: true
  },
  note: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fast retrieval
favoriteSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Favorite', favoriteSchema);

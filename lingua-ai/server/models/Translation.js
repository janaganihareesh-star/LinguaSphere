const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
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
    default: 'auto'
  },
  targetLanguage: {
    type: String,
    required: true
  },
  detectedLanguage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster history retrieval for a specific user
translationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Translation', translationSchema);

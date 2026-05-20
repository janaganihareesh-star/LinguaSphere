const mongoose = require('mongoose');
const axios = require('axios');
const Translation = require('../models/Translation');
const Favorite = require('../models/Favorite');

// @desc    Get user translation stats
// @route   GET /api/translate/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const mongoId = new mongoose.Types.ObjectId(userId);

    const [totalTranslations, totalFavorites, last7Days, topLanguages] = await Promise.all([
      Translation.countDocuments({ userId }),
      Favorite.countDocuments({ userId }),
      Translation.countDocuments({ 
        userId, 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      }),
      Translation.aggregate([
        { $match: { userId: mongoId } },
        { $group: { _id: '$targetLanguage', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.status(200).json({
      success: true,
      totalTranslations,
      totalFavorites,
      last7Days,
      topLanguages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Translate text and save to history
// @route   POST /api/translate
// @access  Private
exports.translateText = async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Please enter text to translate' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ success: false, message: 'Text too long (max 5000 characters)' });
    }

    // Use 'en' as source when auto-detect is selected
    const source = (!sourceLang || sourceLang === 'auto') ? 'en' : sourceLang;
    let result = '';

    try {
      // Primary: Google Translate Free API — Most accurate, supports Telugu perfectly
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      
      const transRes = await axios.get(url, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (transRes.data && transRes.data[0]) {
        // Google returns nested arrays — extract all translated parts and join
        result = transRes.data[0]
          .filter(chunk => chunk && chunk[0])
          .map(chunk => chunk[0])
          .join('');
      }
    } catch (googleError) {
      console.warn('Google API failed, trying fallback:', googleError.message);
    }

    // Fallback API if Google fails
    if (!result) {
      try {
        const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${targetLang}`;
        const fallbackRes = await axios.get(fallbackUrl, { timeout: 10000 });
        if (fallbackRes.data && fallbackRes.data.responseData && fallbackRes.data.responseData.translatedText) {
          result = fallbackRes.data.responseData.translatedText;
        }
      } catch (fallbackError) {
        console.error('Fallback API failed:', fallbackError.message);
      }
    }

    if (!result) {
      throw new Error('All translation services failed to process the text.');
    }

    // SAVE TO HISTORY
    const translation = await Translation.create({
      userId: req.user.id,
      inputText: text,
      translatedText: result,
      sourceLanguage: source,
      targetLanguage: targetLang,
      detectedLanguage: null
    });

    res.status(200).json({
      success: true,
      translatedText: result,
      detectedLanguage: null,
      savedId: translation._id
    });

  } catch (error) {
    console.error('Translation Error:', error.message);
    res.status(500).json({ success: false, message: 'Translation failed. Please try again later.' });
  }
};

// @desc    Get user translation history
// @route   GET /api/translate/history
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const history = await Translation.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete single history item
// @route   DELETE /api/translate/:id
// @access  Private
exports.deleteHistory = async (req, res) => {
  try {
    const translation = await Translation.findById(req.params.id);

    if (!translation) {
      return res.status(404).json({ success: false, message: 'Translation not found' });
    }

    // Security check: ensure user owns this translation
    if (translation.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this' });
    }

    await translation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Translation deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete all history for user
// @route   DELETE /api/translate/history/all
// @access  Private
exports.deleteAllHistory = async (req, res) => {
  try {
    await Translation.deleteMany({ userId: req.user.id });
    res.status(200).json({
      success: true,
      message: 'All history cleared'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

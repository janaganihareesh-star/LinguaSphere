const Favorite = require('../models/Favorite');

// @desc    Add translation to favorites
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res) => {
  try {
    const { inputText, translatedText, sourceLanguage, targetLanguage, note } = req.body;

    // Check if already in favorites
    const exists = await Favorite.findOne({
      userId: req.user.id,
      inputText,
      translatedText
    });

    if (exists) {
      return res.status(409).json({ success: false, message: 'Already in favorites' });
    }

    const favorite = await Favorite.create({
      userId: req.user.id,
      inputText,
      translatedText,
      sourceLanguage,
      targetLanguage,
      note
    });

    res.status(201).json({ success: true, favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all favorites for user
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: favorites.length, favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/favorites/:id
// @access  Private
exports.removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    if (favorite.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await favorite.deleteOne();
    res.status(200).json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if a specific translation is favorited
// @route   GET /api/favorites/check
// @access  Private
exports.checkIsFavorite = async (req, res) => {
  try {
    const { inputText, translatedText } = req.query;
    
    const favorite = await Favorite.findOne({
      userId: req.user.id,
      inputText,
      translatedText
    });

    res.status(200).json({
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite._id : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

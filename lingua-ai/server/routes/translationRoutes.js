const express = require('express');
const router = express.Router();
const axios = require('axios');
const { 
  translateText, 
  getHistory, 
  deleteHistory, 
  deleteAllHistory,
  getUserStats
} = require('../controllers/translationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, translateText);
router.get('/history', protect, getHistory);
router.get('/stats', protect, getUserStats);
router.delete('/history/all', protect, deleteAllHistory);
router.delete('/:id', protect, deleteHistory);

// TTS Proxy — fetches Google TTS audio server-side to avoid CORS issues
router.get('/tts', protect, async (req, res) => {
  try {
    const { text, lang } = req.query;
    if (!text || !lang) return res.status(400).json({ message: 'text and lang required' });

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
    
    const response = await axios.get(ttsUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(response.data);
  } catch (error) {
    console.error('TTS Proxy Error:', error.message);
    res.status(500).json({ message: 'TTS service unavailable' });
  }
});

module.exports = router;

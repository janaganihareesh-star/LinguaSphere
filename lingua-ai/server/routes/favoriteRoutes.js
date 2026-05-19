const express = require('express');
const router = express.Router();
const { 
  addFavorite, 
  getFavorites, 
  removeFavorite, 
  checkIsFavorite 
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes in this file are protected

router.post('/', addFavorite);
router.get('/', getFavorites);
router.get('/check', checkIsFavorite);
router.delete('/:id', removeFavorite);

module.exports = router;

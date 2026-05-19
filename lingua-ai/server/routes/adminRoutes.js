const express = require('express');
const router = express.Router();
const { getSystemStats, getAllUsers, deleteUser } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.use(protect);
router.use(admin);

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;

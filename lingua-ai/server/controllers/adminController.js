const User = require('../models/User');
const Translation = require('../models/Translation');

// @desc    Get system-wide stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = async (req, res) => {
  try {
    const [userCount, translationCount] = await Promise.all([
      User.countDocuments(),
      Translation.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: userCount,
        translations: translationCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

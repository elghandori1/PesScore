const AuthModel = require('../models/authModel');

const profile = async (req, res) => {
  try {
    const userprofile = await AuthModel.findById(req.user.userId);
    if (!userprofile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.json({ userprofile });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Server profile error' });
  }
};

module.exports = { profile };
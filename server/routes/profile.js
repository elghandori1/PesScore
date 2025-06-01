const express = require('express');
const pool = require('../config/db');
const { ensureAuthenticated } = require('../middleware/ensureAuth');

const router = express.Router();

// profile route
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [results] = await pool.query(
      'SELECT id, name_account, id_account, email, created_at FROM users WHERE id = ?',
      [userId]
    );
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: results[0] });
  } catch (err) {
    console.error('profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
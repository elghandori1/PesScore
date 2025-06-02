const express = require('express');
const pool = require('../config/db');
const { ensureAuthenticated } = require('../middleware/ensureAuth');

const router = express.Router();

// Check auth
router.get('/check-auth', ensureAuthenticated, async (req, res) => {
  try {
    const [results] = await pool.query('SELECT id, name_account FROM users WHERE id = ?', [req.session.userId]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: results[0] });
  } catch (err) {
    console.error('Check-auth error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
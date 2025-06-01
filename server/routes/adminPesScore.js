const express = require('express');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const router = express.Router();

// Middleware to ensure admin is authenticated
const ensureAdminAuthenticated = async (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'Admin not authenticated' });
  }
  try {
    const [admin] = await pool.query(
      'SELECT id FROM admins WHERE id = ? AND revoked_at IS NULL',
      [req.session.adminId]
    );
    if (admin.length === 0) {
      req.session.destroy();
      return res.status(401).json({ error: 'Admin access revoked or invalid' });
    }
    next();
  } catch (err) {
    console.error('Admin auth check error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin registration route
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Check if email already exists
    const [existingAdmin] = await pool.query(
      'SELECT id FROM admins WHERE email = ?',
      [email]
    );
    if (existingAdmin.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin with correct column name 'role' instead of 'role_id'
    const [result] = await pool.query(
      'INSERT INTO admins (email, admin_password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'admin']
    );

    if (result.affectedRows === 1) {
      res.status(201).json({ message: 'Admin registered successfully' });
    } else {
      res.status(500).json({ error: 'Failed to register admin' });
    }
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ error: 'Failed to register admin: ' + err.message });
  }
});

// Admin login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ error: 'Email and password are required' });
  }
  try {
    // Fetch admin by email
    const [admins] = await pool.query(
      'SELECT id, email, admin_password FROM admins WHERE email = ? AND revoked_at IS NULL',
      [email]
    );
    if (admins.length === 0) {
      return res.json({ error: 'Invalid email' });
    }

    const admin = admins[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.admin_password);
    if (!isMatch) {
      return res.json({ error: 'Invalid password' });
    }

    // Store admin ID in session
    req.session.adminId = admin.id;
    res.json({ message: 'Admin login successful' });
  } catch (err) {
    console.error('Admin login error:', err);
    res.json({ error: 'Internal server error' });
  }
});

// Get all users and count (admin-only)
router.get('/users', ensureAdminAuthenticated, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name_account, id_account, email, created_at FROM users ORDER BY created_at DESC'
    );
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = countResult[0].total;

    res.json({
      users,
      totalUsers
    });
  } catch (err) {
    console.error('Fetch users error:', err);
    res.json({ error: 'Internal server error' });
  }
});

// Admin logout route
router.post('/logout', ensureAdminAuthenticated, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.json({ error: 'Failed to log out' });
    }
    res.json({ message: 'Admin logged out successfully' });
  });
});

// Delete user route
router.delete('/users/:userId', ensureAdminAuthenticated, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ?',
      [req.params.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get admin profile
router.get('/profile', ensureAdminAuthenticated, async (req, res) => {
  try {
    const [admin] = await pool.query(
      'SELECT id, email, name FROM admins WHERE id = ?',
      [req.session.adminId]
    );
    if (admin.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json(admin[0]);
  } catch (err) {
    console.error('Fetch admin error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update admin email
router.put('/update-email', ensureAdminAuthenticated, async (req, res) => {
  const { newEmail, password } = req.body;
  try {
    // Verify current password first
    const [admin] = await pool.query(
      'SELECT admin_password FROM admins WHERE id = ?',
      [req.session.adminId]
    );
    
    const isMatch = await bcrypt.compare(password, admin[0].admin_password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    await pool.query(
      'UPDATE admins SET email = ? WHERE id = ?',
      [newEmail, req.session.adminId]
    );
    
    res.json({ message: 'Email updated successfully' });
  } catch (err) {
    console.error('Update email error:', err);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// Update admin password
router.put('/update-password', ensureAdminAuthenticated, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    // Verify current password
    const [admin] = await pool.query(
      'SELECT admin_password FROM admins WHERE id = ?',
      [req.session.adminId]
    );
    
    const isMatch = await bcrypt.compare(currentPassword, admin[0].admin_password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE admins SET admin_password = ? WHERE id = ?',
      [hashedPassword, req.session.adminId]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name_account, id_account,email, password } = req.body;

    // Validation
    if (!name_account || !id_account || !email || !password) {
      return res.status(400).json({ error: 'يجب ملء جميع الحقول' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صالحة" });
    }

    if (name_account.length < 3 || name_account.length > 16) {
      return res.status(400).json({ error: 'يجب أن يكون اسم الحساب من 3 إلى 16 حرفًا' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' });
    }

    // Check if user already exists by id_account
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE id_account = ?',
      [id_account]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'اسم المستخدم موجود مسبقًا' });
    }

    // Check if email already exists
    const [existingEmail] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'عنوان البريد الإلكتروني مسجل مسبقًا' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (name_account, id_account, email, password_hash) VALUES (?, ?,?, ?)',
      [name_account, id_account, email,password_hash]
    );

    // Create session
    req.session.userId = result.insertId;

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: result.insertId, name_account }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { id_account, password } = req.body;

    // Validation
    if (!id_account || !password) {
      return res.status(400).json({ error: 'يجب ملء جميع الحقول' });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id_account = ?',
      [id_account]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'بيانات الاعتماد غير صالحة' });
    }

    const user = users[0];

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'بيانات الاعتماد غير صالحة' });
    }

    // Create session
    req.session.userId = user.id;

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, name_account: user.name_account }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('session_cookie_name');
    res.json({ message: 'Logout successful' });
  });
});

module.exports = router;
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const pool = require('./config/db');
const connectRoutes = require('./routes/connection');
const authRoutes = require('./routes/auth');
const friendsRoutes = require('./routes/friends');
const profileRoutes = require('./routes/profile')
const matchesRoutes = require('./routes/matches');
const adminPesScoreRoutes = require('./routes/adminPesScore');
const app = express();

// Session store configuration
const sessionStore = new MySQLStore({}, pool);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET || 'your_secret_key_here',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Routes
app.use('/auth', authRoutes);
app.use('/connection', connectRoutes);
app.use('/friends', friendsRoutes);
app.use('/profile',profileRoutes);
app.use('/matches',matchesRoutes);
app.use('/admin-pesScore', adminPesScoreRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
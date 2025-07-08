const express = require('express');
const router = express.Router();
const { register, login, connectUser,logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// const rateLimit = require('express-rate-limit');

// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit to 5 login attempts per window
//   message: 'Too many login attempts, please try again later',
// });

router.post('/register', register);
router.post('/login' ,login);
router.get('/logout', authMiddleware,logout);

// Secure getting connect user route
router.get('/connect-user', authMiddleware, connectUser);
module.exports = router;

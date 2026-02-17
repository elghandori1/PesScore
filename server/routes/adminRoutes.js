const express = require('express');
const router = express.Router();
const { adminLogin, registerAdmin, checkAdminExists, getAllUsers } = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/login', adminLogin);
router.post('/register', registerAdmin);
router.get('/check-exists', checkAdminExists);
router.get('/users', adminMiddleware, getAllUsers);

module.exports = router;

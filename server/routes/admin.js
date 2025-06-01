const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// Endpoint to check the count of admin users
router.get('/check-count', async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    res.json({ count: adminCount });
  } catch (error) {
    res.status(500).json({ message: "Error checking admin count" });
  }
});

module.exports = router;
const express = require("express");
const router  = express.Router();

const { CreateMatch } = require("../controllers/MatchController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, CreateMatch);

module.exports = router;
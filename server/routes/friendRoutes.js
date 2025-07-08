const express = require('express');
const router = express.Router();
const { SearchFriend, requestFriend, PendingRequests,cancelFriendRequest } = require('../controllers/FriendController');
const authMiddleware = require('../middleware/authMiddleware');

router.get("/search", authMiddleware, SearchFriend);
router.post("/request", authMiddleware, requestFriend);
router.get("/pending", authMiddleware, PendingRequests);
router.delete("/request/:id", authMiddleware, cancelFriendRequest);

module.exports = router;

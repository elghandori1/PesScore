const express = require('express');
const router = express.Router();
const { SearchFriend, requestFriend, 
        PendingRequests,
        cancelFriendRequest,
        ReceivedFriends
     } = require('../controllers/FriendController');
const authMiddleware = require('../middleware/authMiddleware');

router.get("/search", authMiddleware, SearchFriend);
router.post("/request", authMiddleware, requestFriend);
router.get("/pending", authMiddleware, PendingRequests);
router.delete("/request/:id", authMiddleware, cancelFriendRequest);

// for dashboard pending part
router.get("/received", authMiddleware, ReceivedFriends);

module.exports = router;

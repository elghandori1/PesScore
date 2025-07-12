const express = require('express');
const router = express.Router();
const { SearchFriend, requestFriend, 
        PendingRequests,
        cancelFriendRequest,
        ReceivedFriends,
        AcceptFriendRequest,
        RejectFriendRequest,
        getFriends,
        RemoveFriendRequest,
        CancelRemoveFriend,
        AcceptRemoveFriend,
        RejectRemoveFriend
     } = require('../controllers/FriendController');
const authMiddleware = require('../middleware/authMiddleware');

router.get("/search", authMiddleware, SearchFriend);
router.post("/request", authMiddleware, requestFriend);
router.get("/pending", authMiddleware, PendingRequests);
router.delete("/request/:id", authMiddleware, cancelFriendRequest);

// for dashboard friends part
router.get("/list-friend", authMiddleware, getFriends);
router.put("/remove-request/:id", authMiddleware, RemoveFriendRequest);
router.put("/cancel-remove-request/:id", authMiddleware, CancelRemoveFriend);
router.put("/accept-remove-request/:id", authMiddleware, AcceptRemoveFriend);
router.put("/reject-remove-request/:id", authMiddleware, RejectRemoveFriend);

// for dashboard pending part
router.get("/received", authMiddleware, ReceivedFriends);
router.post("/accept-request/:id", authMiddleware, AcceptFriendRequest);
router.delete("/reject-request/:id", authMiddleware, RejectFriendRequest);

module.exports = router;
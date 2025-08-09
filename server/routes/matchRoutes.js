const express = require("express");
const router  = express.Router();

const { CreateMatch ,
    getSentPendingMatches,
    getReceivedPendingMatches,
    acceptMatch,
    rejectMatch,
    cancelMatch,
    getRejectedSentMatches,
    resendMatchRequest,
    cancelRejectedMatch,
    getMatchesBetweenFriends,
    removeMatch,
    cancelRemoveMatch,
    acceptRemoveMatch,
    rejectRemoveMatch,
    notifSentPendingMatches,
    notifReceivedPendingMatches,
    notifRejectedSentMatches
    } = require("../controllers/MatchController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, CreateMatch);

router.get('/pending/:friendId', authMiddleware, getSentPendingMatches);
router.get('/received/:friendId', authMiddleware, getReceivedPendingMatches);
router.get('/rejected/:friendId', authMiddleware, getRejectedSentMatches);

// GET /match/pending
router.get('/pending', authMiddleware, notifSentPendingMatches);
// GET /match/received
router.get('/received', authMiddleware, notifReceivedPendingMatches);
router.get('/rejected', authMiddleware, notifRejectedSentMatches);

// matchRoutes.js
router.post("/resend/:matchId", authMiddleware, resendMatchRequest);

router.post('/cancel-reject/:id', authMiddleware, cancelRejectedMatch);

// POST /match/accept/:id
router.post('/accept/:id', authMiddleware, acceptMatch);

// POST /match/reject/:id
router.post('/reject/:id', authMiddleware, rejectMatch);

// DELETE /match/cancel/:id
router.delete('/cancel/:id', authMiddleware, cancelMatch);

router.get('/score/:friendId', authMiddleware, getMatchesBetweenFriends);

router.post('/removematch/:matchId', authMiddleware, removeMatch);
router.post('/cancelremove/:matchId', authMiddleware, cancelRemoveMatch);
// Add these new routes

router.post('/acceptremove/:matchId', authMiddleware, acceptRemoveMatch);
router.post('/rejectremove/:matchId', authMiddleware, rejectRemoveMatch);

module.exports = router;
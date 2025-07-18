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
    cancelRejectedMatch
    } = require("../controllers/MatchController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, CreateMatch);

// GET /match/pending
router.get('/pending', authMiddleware, getSentPendingMatches);

// GET /match/received
router.get('/received', authMiddleware, getReceivedPendingMatches);
router.get('/rejected', authMiddleware, getRejectedSentMatches);
// matchRoutes.js
router.post("/resend/:matchId", authMiddleware, resendMatchRequest);
router.post('/cancel-reject/:id', authMiddleware, cancelRejectedMatch);

// POST /match/accept/:id
router.post('/accept/:id', authMiddleware, acceptMatch);

// POST /match/reject/:id
router.post('/reject/:id', authMiddleware, rejectMatch);


// DELETE /match/cancel/:id
router.delete('/cancel/:id', authMiddleware, cancelMatch);


module.exports = router;
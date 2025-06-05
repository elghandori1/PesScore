const express = require('express');
const pool = require('../config/db');
const { ensureAuthenticated } = require('../middleware/ensureAuth');

const router = express.Router();

// Get match history between current user and friend
router.get('/matches-score/:id', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const friendId = req.params.id;

    // Verify friendship (allow both active and pending_removal statuses)
    const [friendship] = await pool.query(
      `SELECT id FROM friendships 
       WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?) 
       AND status IN ('active', 'pending_removal')`,
      [userId, friendId, friendId, userId]
    );

    if (friendship.length === 0) {
      return res.status(404).json({ error: 'الصديق غير موجود أو لم يُقبل' });
    }

    // Fetch match history
    const [matches] = await pool.query(
      `SELECT m.id, m.player1_id, m.player2_id, m.player1_score, m.player2_score, 
              m.winner_id, m.status, m.match_date, m.created_by,
              u.name_account AS creator_name,
              u1.name_account AS player1_name,
              u2.name_account AS player2_name
       FROM matches m
       JOIN users u ON m.created_by = u.id
       JOIN users u1 ON m.player1_id = u1.id
       JOIN users u2 ON m.player2_id = u2.id
       WHERE (m.player1_id = ? AND m.player2_id = ?) OR (m.player1_id = ? AND m.player2_id = ?)
       ORDER BY m.match_date DESC`,
      [userId, friendId, friendId, userId]
    );

    // Fetch friend details
    const [friend] = await pool.query(
      `SELECT id, name_account, id_account FROM users WHERE id = ?`,
      [friendId]
    );

    // Fetch friendship status and requested_by to determine removal request initiator
    const [friendshipDetails] = await pool.query(
      `SELECT status, requested_by FROM friendships 
       WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
      [userId, friendId, friendId, userId]
    );

    res.json({ 
      matches, 
      friend: friend[0], 
      friendship: friendshipDetails[0] // Include friendship details in response
    });
  } catch (err) {
    console.error('Fetch matches error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Create a new match
router.post('/create-match', ensureAuthenticated, async (req, res) => {
  try {
    const { friendId, userScore, friendScore } = req.body;
    const userId = req.session.userId;

    if (!friendId || userScore === undefined || friendScore === undefined) {
      return res.status(400).json({ error: 'معرّف الصديق ونقاط المستخدم ونقاط الصديق مطلوبة' });
    }

    // Validate scores
    if (!Number.isInteger(Number(userScore)) || !Number.isInteger(Number(friendScore)) ||
        userScore < 0 || friendScore < 0 || userScore > 20 || friendScore > 20) {
      return res.status(400).json({ error: 'يجب أن تكون النقاط أرقامًا صحيحة من 0 إلى 20' });
    }

    // Verify friendship
    const [friendship] = await pool.query(
      `SELECT id FROM friendships 
       WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?) 
       AND status = 'active'`,
      [userId, friendId, friendId, userId]
    );

    if (friendship.length === 0) {
      return res.status(404).json({ error: 'لم يتم العثور على الصديق أو لم يتم قبوله' });
    }

    // Determine winner (null for draws)
    let winnerId = null;  // Default to null for draws
    if (userScore > friendScore) {
      winnerId = userId;
    } else if (friendScore > userScore) {
      winnerId = friendId;
    }

    // Insert match (handles draws correctly now)
    const [result] = await pool.query(
      `INSERT INTO matches (player1_id, player2_id, player1_score, player2_score, winner_id, status, created_by)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [userId, friendId, userScore, friendScore, winnerId, userId]
    );

    res.status(201).json({ message: 'تم إنشاء المباراة بنجاح', matchId: result.insertId });
  } catch (err) {
    console.error('Create match error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept a match
router.post('/accept-match/:id', ensureAuthenticated, async (req, res) => {
  try {
    const matchId = req.params.id;
    const userId = req.session.userId;

    // Verify match exists and user is involved
    const [match] = await pool.query(
      `SELECT * FROM matches WHERE id = ? AND player2_id = ? AND status = 'pending'`,
      [matchId, userId]
    );

    if (match.length === 0) {
      return res.status(404).json({ error: 'المباراة غير موجودة أو تمت معالجتها مسبقاً' });
    }

    // Update match status
    await pool.query(
      `UPDATE matches SET status = 'confirmed' WHERE id = ?`,
      [matchId]
    );

    res.json({ message: 'تم قبول المباراة بنجاح' });
  } catch (err) {
    console.error('Accept match error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject a match
router.post('/reject-match/:id', ensureAuthenticated, async (req, res) => {
  try {
    const matchId = req.params.id;
    const userId = req.session.userId;

    // Verify match exists and user is involved
    const [match] = await pool.query(
      `SELECT * FROM matches WHERE id = ? AND player2_id = ? AND status = 'pending'`,
      [matchId, userId]
    );

    if (match.length === 0) {
      return res.status(404).json({ error: 'المباراة غير موجودة أو لا يمكن حذفها' });
    }

    // Update match status to rejected instead of deleting
    await pool.query(
      `UPDATE matches SET status = 'rejected' WHERE id = ?`,
      [matchId]
    );

    res.json({ message: 'تم رفض المباراة بنجاح' });
  } catch (err) {
    console.error('Reject match error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new endpoint for resending a match
router.post('/resend-match/:id', ensureAuthenticated, async (req, res) => {
  try {
    const matchId = req.params.id;
    const userId = req.session.userId;

    // Verify match exists and was created by the user
    const [match] = await pool.query(
      `SELECT * FROM matches WHERE id = ? AND created_by = ? AND status = 'rejected'`,
      [matchId, userId]
    );

    if (match.length === 0) {
      return res.status(404).json({ error: 'المباراة غير موجودة أو لا يمكن حذفها' });
    }

    // Create a new match with the same scores
    await pool.query(
      `INSERT INTO matches (player1_id, player2_id, player1_score, player2_score, winner_id, status, created_by)
       SELECT player1_id, player2_id, player1_score, player2_score, winner_id, 'pending', created_by
       FROM matches WHERE id = ?`,
      [matchId]
    );

    // Delete the old rejected match
    await pool.query('DELETE FROM matches WHERE id = ?', [matchId]);

    res.json({ message: 'تمت إعادة إرسال المباراة بنجاح' });
  } catch (err) {
    console.error('Resend match error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel a match
router.delete('/cancel-match/:id', ensureAuthenticated, async (req, res) => {
  try {
    const matchId = req.params.id;
    const userId = req.session.userId;

    // Verify match exists and was created by the user, including matches with null winner_id (draws)
    const [match] = await pool.query(
      `SELECT * FROM matches 
       WHERE id = ? 
       AND created_by = ? 
       AND (status = 'pending' OR status = 'rejected')`,
      [matchId, userId]
    );

    if (match.length === 0) {
      return res.status(404).json({ error: 'المباراة غير موجودة أو لا يمكن إلغاؤها' });
    }

    // Delete the match
    await pool.query('DELETE FROM matches WHERE id = ?', [matchId]);

    res.json({ message: 'تم إلغاء المباراة بنجاح' });
  } catch (err) {
    console.error('Cancel match error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request match deletion
router.post('/request-delete/:id', ensureAuthenticated, async (req, res) => {
  try {
    const matchId = req.params.id;
    const userId = req.session.userId;

    // Verify match exists and user is involved
    const [match] = await pool.query(
      `SELECT * FROM matches 
       WHERE id = ? AND (player1_id = ? OR player2_id = ?) 
       AND status = 'confirmed'`,
      [matchId, userId, userId]
    );

    if (match.length === 0) {
      return res.status(404).json({ error: 'المباراة غير موجودة أو لا يمكن حذفها' });
    }

    // Check if there's already a deletion request from the other player
    const [existingRequest] = await pool.query(
      `SELECT * FROM match_deletion_requests 
       WHERE match_id = ? AND requested_by != ? AND status = 'pending'`,
      [matchId, userId]
    );

    if (existingRequest.length > 0) {
      // If other player already requested deletion, delete the match immediately
      await pool.query('DELETE FROM matches WHERE id = ?', [matchId]);
      return res.json({ message: 'تم حذف المباراة بنجاح', deleted: true });
    }

    // Check if active deletion request already exists from this user
    const [myRequest] = await pool.query(
      `SELECT * FROM match_deletion_requests 
       WHERE match_id = ? AND requested_by = ? AND status = 'pending'`,
      [matchId, userId]
    );

    if (myRequest.length > 0) {
      return res.status(400).json({ error: 'هناك طلب حذف قيد الانتظار بالفعل' });
    }

    // Delete any previous rejected requests for this match by this user
    await pool.query(
      `DELETE FROM match_deletion_requests 
       WHERE match_id = ? AND requested_by = ? AND status = 'rejected'`,
      [matchId, userId]
    );

    // Create new deletion request
    await pool.query(
      `INSERT INTO match_deletion_requests (match_id, requested_by) 
       VALUES (?, ?)`,
      [matchId, userId]
    );

    res.json({ message: 'تم طلب حذف المباراة بنجاح', deleted: false });
  } catch (err) {
    console.error('Request match deletion error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel match deletion request
router.post('/cancel-delete/:id', ensureAuthenticated, async (req, res) => {
  try {
    const matchId = req.params.id;
    const userId = req.session.userId;

    // Delete the request
    await pool.query(
      `DELETE FROM match_deletion_requests 
       WHERE match_id = ? AND requested_by = ? AND status = 'pending'`,
      [matchId, userId]
    );

    res.json({ message: 'تم إلغاء طلب الحذف بنجاح' });
  } catch (err) {
    console.error('Cancel deletion request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Respond to match deletion request
router.post('/respond-delete/:id', ensureAuthenticated, async (req, res) => {
  try {
    const matchId = req.params.id;
    const userId = req.session.userId;
    const { accept } = req.body;

    // Verify user is involved in the match
    const [match] = await pool.query(
      `SELECT * FROM matches 
       WHERE id = ? AND (player1_id = ? OR player2_id = ?)`,
      [matchId, userId, userId]
    );

    if (match.length === 0) {
      return res.status(404).json({ error: 'لم يتم العثور على المباراة' });
    }

    if (accept) {
      // Delete the match if accepted
      await pool.query('DELETE FROM matches WHERE id = ?', [matchId]);
    } else {
      // Update request status to rejected if not accepted
      await pool.query(
        `UPDATE match_deletion_requests 
         SET status = 'rejected', responded_at = NOW() 
         WHERE match_id = ?`,
        [matchId]
      );
    }

    const message = accept
    ? "تم قبول طلب الحذف بنجاح" // Deletion request accepted successfully
    : "تم رفض طلب الحذف بنجاح";   // Deletion request rejected successfully
  res.json({ message: message });
  } catch (err) {
    console.error('Respond to deletion request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch deletion requests
router.get('/deletion-requests', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;

    // Modified query to include more details about the request
    const [requests] = await pool.query(
      `SELECT mdr.*, m.player1_id, m.player2_id, m.created_by 
       FROM match_deletion_requests mdr
       JOIN matches m ON mdr.match_id = m.id
       WHERE (m.player1_id = ? OR m.player2_id = ?)
       AND mdr.status = 'pending'`,
      [userId, userId]
    );

    res.json({ requests });
  } catch (err) {
    console.error('Fetch deletion requests error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch all pending matches where the user is the receiver
router.get('/pending-matches/received', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [matches] = await pool.query(
      `SELECT m.id, m.player1_id, m.player2_id, u.name_account AS player1_name
       FROM matches m
       JOIN users u ON m.player1_id = u.id
       WHERE m.player2_id = ? AND m.status = 'pending'`,
      [userId]
    );

    // Group by player1_id to count pending matches per friend
    const pendingMatches = {};
    matches.forEach((match) => {
      const friendId = match.player1_id;
      pendingMatches[friendId] = (pendingMatches[friendId] || 0) + 1;
    });

    res.json({ pendingMatches });
  } catch (err) {
    console.error('Fetch pending matches error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch all rejected matches where the user is the sender
router.get('/rejected-matches/sent', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [matches] = await pool.query(
      `SELECT m.id, m.player1_id, m.player2_id, u.name_account AS player2_name
       FROM matches m
       JOIN users u ON m.player2_id = u.id
       WHERE m.created_by = ? AND m.status = 'rejected'`,
      [userId]
    );

    // Group by player2_id to count rejected matches per friend
    const rejectedMatches = {};
    matches.forEach((match) => {
      const friendId = match.player2_id;
      rejectedMatches[friendId] = (rejectedMatches[friendId] || 0) + 1;
    });

    res.json({ rejectedMatches });
  } catch (err) {
    console.error('Fetch rejected matches error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
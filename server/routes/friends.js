const express = require('express');
const pool = require('../config/db');
const { ensureAuthenticated } = require('../middleware/ensureAuth');

const router = express.Router();

// Search users route
router.get('/search-users', ensureAuthenticated, async (req, res) => {
  try {
    const query = req.query.query;
    const userId = req.session.userId;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'يجب إدخال عبارة البحث' });
    }

    const [results] = await pool.query(
      `SELECT id, name_account , id_account 
       FROM users 
       WHERE (name_account = ? OR id_account = ?) AND id != ?`,
      [query, query, userId]
    );

    res.json({ users: results });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send friend request route
router.post('/send-friend-request', ensureAuthenticated, async (req, res) => {
  try {
    const { receiver_id } = req.body;
    const sender_id = req.session.userId;

    if (!receiver_id) {
      return res.status(400).json({ error: 'معرّف المستلم مطلوب' });
    }

    if (sender_id === receiver_id) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if there's an existing request from the receiver
    const [existingReceiverRequest] = await pool.query(
      'SELECT id FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = ?',
      [receiver_id, sender_id, 'pending']
    );

    if (existingReceiverRequest.length > 0) {
      // Auto-accept the existing request
      await pool.query('START TRANSACTION');
      try {
        // Delete the existing request
        await pool.query('DELETE FROM friend_requests WHERE id = ?', [existingReceiverRequest[0].id]);

        // Create friendship
        await pool.query(
          'INSERT INTO friendships (user1_id, user2_id, status, requested_by, created_at) VALUES (?, ?, ?, ?, NOW())',
          [Math.min(sender_id, receiver_id), Math.max(sender_id, receiver_id), 'active', receiver_id]
        );

        await pool.query('COMMIT');
        return res.status(200).json({ message: 'تم قبول طلب الصداقة تلقائيًا' });
      } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
      }
    }

    // Continue with normal friend request logic
    const [receiver] = await pool.query('SELECT id FROM users WHERE id = ?', [receiver_id]);
    if (receiver.length === 0) {
      return res.status(404).json({ error: 'اسم المستخدم غير موجود' });
    }

    const [existingRequest] = await pool.query(
      'SELECT id FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = ?',
      [sender_id, receiver_id, 'pending']
    );
    if (existingRequest.length > 0) {
      return res.status(400).json({ error: 'طلب الصداقة مرسل مسبقاً' });
    }

    const [existingFriendship] = await pool.query(
      'SELECT id FROM friendships WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
      [sender_id, receiver_id, receiver_id, sender_id]
    );
    if (existingFriendship.length > 0) {
      return res.status(400).json({ error: 'You are already friends with this user' });
    }

    await pool.query(
      'INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, ?)',
      [sender_id, receiver_id, 'pending']
    );

    res.status(201).json({ message: 'تم إرسال طلب الصداقة بنجاح' });
  } catch (err) {
    console.error('Friend request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending sent friend requests
router.get('/pending-friend-requests/sent', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [results] = await pool.query(
      `SELECT fr.id, fr.receiver_id, u.name_account ,u.created_at
       FROM friend_requests fr
       JOIN users u ON fr.receiver_id = u.id
       WHERE fr.sender_id = ? AND fr.status = 'pending'`,
      [userId]
    );
    res.json({ pendingSentRequests: results });
  } catch (err) {
    console.error('Pending sent friend requests error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending received friend requests
router.get('/pending-friend-requests/received', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [results] = await pool.query(
      `SELECT fr.id, fr.sender_id, u.name_account, u.created_at
       FROM friend_requests fr
       JOIN users u ON fr.sender_id = u.id
       WHERE fr.receiver_id = ? AND fr.status = 'pending'`,
      [userId]
    );
    res.json({ pendingReceivedRequests: results });
  } catch (err) {
    console.error('Pending received friend requests error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel sent friend request
router.delete('/cancel-friend-request/:id', ensureAuthenticated, async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.session.userId;

    const [request] = await pool.query(
      'SELECT id FROM friend_requests WHERE id = ? AND sender_id = ? AND status = ?',
      [requestId, userId, 'pending']
    );

    if (request.length === 0) {
      return res.status(404).json({ error: 'Friend request not found or not authorized' });
    }

    await pool.query('DELETE FROM friend_requests WHERE id = ?', [requestId]);

    res.json({ message: 'تم إلغاء طلب الصداقة بنجاح' });
  } catch (err) {
    console.error('Cancel friend request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List accepted friends
router.get('/list-friends', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [results] = await pool.query(
      `SELECT u.id, u.name_account, u.id_account, f.created_at, f.status, f.requested_by
       FROM friendships f
       JOIN users u ON (u.id = f.user1_id OR u.id = f.user2_id)
       WHERE (f.user1_id = ? OR f.user2_id = ?) AND u.id != ?`,
      [userId, userId, userId]
    );
    res.json({ friends: results });
  } catch (err) {
    console.error('List friends error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept friend request
router.post('/accept-friend-request/:id', ensureAuthenticated, async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.session.userId;

    const [request] = await pool.query(
      'SELECT sender_id FROM friend_requests WHERE id = ? AND receiver_id = ? AND status = ?',
      [requestId, userId, 'pending']
    );

    if (request.length === 0) {
      return res.status(404).json({ error: 'طلب الصداقة غير موجود أو غير مصرح لك' });
    }

    const senderId = request[0].sender_id;

    await pool.query('START TRANSACTION');

    try {
      await pool.query('DELETE FROM friend_requests WHERE id = ?', [requestId]);

      await pool.query(
        'INSERT INTO friendships (user1_id, user2_id, status, requested_by, created_at) VALUES (?, ?, ?, ?, NOW())',
        [Math.min(senderId, userId), Math.max(senderId, userId), 'active', senderId]
      );

      await pool.query('COMMIT');

      res.json({ message: 'تم قبول طلب الصداقة بنجاح' });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Accept friend request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject friend request
router.delete('/reject-friend-request/:id', ensureAuthenticated, async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.session.userId;

    const [request] = await pool.query(
      'SELECT id FROM friend_requests WHERE id = ? AND receiver_id = ? AND status = ?',
      [requestId, userId, 'pending']
    );

    if (request.length === 0) {
      return res.status(404).json({ error: 'Friend request not found or not authorized' });
    }

    await pool.query('DELETE FROM friend_requests WHERE id = ?', [requestId]);

    res.json({ message: 'تم رفض طلب الصداقة بنجاح' });
  } catch (err) {
    console.error('Reject friend request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove friend (initiate removal request)
router.post('/remove-friend/:friendId', ensureAuthenticated, async (req, res) => {
  try {
    const friendId = parseInt(req.params.friendId);
    const userId = req.session.userId;

    if (friendId === userId) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }

    const [friendship] = await pool.query(
      'SELECT id, status FROM friendships WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
      [userId, friendId, friendId, userId]
    );

    if (friendship.length === 0) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    if (friendship[0].status === 'pending_removal') {
      return res.status(400).json({ error: 'الصداقة قيد الإزالة بالفعل' });
    }

    await pool.query(
      'UPDATE friendships SET status = ?, requested_by = ? WHERE id = ?',
      ['pending_removal', userId, friendship[0].id]
    );
    res.json({ message: 'تم إرسال طلب إزالة الصداقة بنجاح' });
  } catch (err) {
    console.error('Remove friend error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel a pending removal request (by initiator)
router.post('/cancel-removal/:friendId', ensureAuthenticated, async (req, res) => {
  try {
    const friendId = parseInt(req.params.friendId);
    const userId = req.session.userId;

    const [friendship] = await pool.query(
      'SELECT id FROM friendships WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?) AND status = ? AND requested_by = ?',
      [userId, friendId, friendId, userId, 'pending_removal', userId]
    );

    if (friendship.length === 0) {
      return res.status(404).json({ error: 'طلب الصداقة غير موجود أو غير مصرح لك' });
    }

    await pool.query('START TRANSACTION');

    try {
      // Revert friendship to active
      await pool.query(
        'UPDATE friendships SET status = ?, requested_by = NULL WHERE id = ?',
        ['active', friendship[0].id]
      );

      await pool.query('COMMIT');

      res.json({ message: 'تم إلغاء طلب إزالة الصداقة بنجاح' });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Cancel removal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept removal request (delete friendship)
router.post('/accept-removal/:friendId', ensureAuthenticated, async (req, res) => {
  try {
    const friendId = parseInt(req.params.friendId);
    const userId = req.session.userId;

    const [friendship] = await pool.query(
      'SELECT id FROM friendships WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?) AND status = ? AND requested_by != ?',
      [userId, friendId, friendId, userId, 'pending_removal', userId]
    );

    if (friendship.length === 0) {
      return res.status(404).json({ error: 'طلب الصداقة غير موجود أو غير مصرح لك' });
    }

    await pool.query('START TRANSACTION');

    try {
      // Delete all matches between the two users
      await pool.query(
        'DELETE FROM matches WHERE (player1_id = ? AND player2_id = ?) OR (player1_id = ? AND player2_id = ?)',
        [userId, friendId, friendId, userId]
      );

      // Delete the friendship
      await pool.query('DELETE FROM friendships WHERE id = ?', [friendship[0].id]);

      await pool.query('COMMIT');

      res.json({ message: 'تمت إزالة الصداقة والمباريات المتعلقة بها بنجاح' });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Accept removal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject removal request (revert to active)
router.post('/reject-removal/:friendId', ensureAuthenticated, async (req, res) => {
  try {
    const friendId = parseInt(req.params.friendId);
    const userId = req.session.userId;

    const [friendship] = await pool.query(
      'SELECT id FROM friendships WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?) AND status = ? AND requested_by != ?',
      [userId, friendId, friendId, userId, 'pending_removal', userId]
    );

    if (friendship.length === 0) {
      return res.status(404).json({ error: 'طلب الصداقة غير موجود أو غير مصرح لك' });
    }

    await pool.query('START TRANSACTION');

    try {
      // Revert friendship to active
      await pool.query(
        'UPDATE friendships SET status = ?, requested_by = NULL WHERE id = ?',
        ['active', friendship[0].id]
      );

      await pool.query('COMMIT');

      res.json({ message: 'Friendship restored to active' });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Reject removal error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
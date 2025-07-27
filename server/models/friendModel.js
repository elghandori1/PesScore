const pool = require('../config/db');

class friendModel {
  static async searchFriend(userId, query) {
    const [users] = await pool.query(
      "SELECT  id, name_account , id_account FROM users WHERE (name_account = ? OR id_account = ?) AND id != ?",
      [query, query, userId]
    );
    return users;
  }

  static async addFriend(receiverId, senderId) {
    const connection = await pool.getConnection();
  
    try {
      await connection.beginTransaction();
  
      const [existingRequest] = await connection.query(
        'SELECT id FROM friend_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
        [senderId, receiverId, receiverId, senderId]
      );
  
      if (existingRequest.length > 0) {
        await connection.rollback();
        throw { message: "يوجد طلب صداقة بين المستخدمين" };
      }
  
      const [existingFriendship] = await connection.query(
        'SELECT id FROM friendships WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
        [senderId, receiverId, receiverId, senderId]
      );
  
      if (existingFriendship.length > 0) {
        await connection.rollback();
        throw { message: "هادا المستخدم يوجد في قائة الأصدقاء" };
      }
  
      await connection.query(
        "INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, ?)",
        [senderId, receiverId, "pending"]
      );
  
      connection.commit();

    } catch (error) {
      connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async pending_requests(userId) { 
    const [user] = await pool.query(
      `SELECT fr.id, fr.receiver_id, u.name_account, id_account ,u.created_at
      FROM friend_requests fr
      JOIN users u ON fr.receiver_id = u.id
      WHERE fr.sender_id = ? AND fr.status = 'pending'`,
      [userId]
    );
    return user;
  }

  static async cancel_Request(senderId, requestId) {
    const [result] = await pool.query(
      'DELETE FROM friend_requests WHERE id = ? AND sender_id = ? AND status = "pending"',
      [requestId, senderId]
    );
    return result;
  }

  static async received_friends(userId) {
    const [users] = await pool.query(
      `SELECT fr.id, fr.sender_id, u.name_account, id_account ,u.created_at
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = ? AND fr.status = 'pending'`,
      [userId]
    );
    return users;
  }

  static async accept_friend_request(userId, requestId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [requests] = await connection.query(
        'SELECT * FROM friend_requests WHERE id = ? AND receiver_id = ? AND status = "pending"',
        [requestId, userId]
      );

      if (requests.length === 0) {
        await connection.rollback();
        return null;
      }

      const request = requests[0];
      const senderId = request.sender_id;

      await connection.query("DELETE FROM friend_requests WHERE id = ?", [
        requestId,
      ]);

      await connection.query(
        "INSERT INTO friendships (user1_id, user2_id, status, requested_by, created_at) VALUES (?, ?, ?, ?, NOW())",
        [
          Math.min(senderId, userId),
          Math.max(senderId, userId),
          "active",
          senderId,
        ]
      );

      await connection.commit();
      return request;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async reject_friend_request(userId, requestId) {
    const [result] = await pool.query(
      'DELETE FROM friend_requests WHERE id = ? AND receiver_id = ? AND status = "pending"',
      [requestId, userId]
    );
    return result;
  }

  static async getFriends(userId) {
    const [friends] = await pool.query(
    `SELECT u.id, u.name_account, u.id_account, f.created_at, f.status, f.requested_by
       FROM friendships f
       JOIN users u ON (u.id = f.user1_id OR u.id = f.user2_id)
       WHERE (f.user1_id = ? OR f.user2_id = ?) AND u.id != ? order by f.created_at DESC`,
      [userId, userId, userId]
    );
    return friends;
  }

  // Remove a friend request
 static async removeFriend_request(userId, friendId)
 {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [friendship] = await connection.query(
      'SELECT id, status FROM friendships WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
      [userId, friendId, friendId, userId]
    );

    if (friendship.length === 0) {
      await connection.rollback();
      throw { message: 'لم يتم العثور على الصداقة' };
    }

    if (friendship[0].status === 'pending_removal') {
      await connection.rollback();
      throw { message: 'الصداقة قيد الإزالة بالفعل' };
    }

    await connection.query(
      'UPDATE friendships SET status = ?, requested_by = ? WHERE id = ?',
      ['pending_removal', userId, friendship[0].id]
    );

    await connection.commit();
    return { id: friendship[0].id };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

 // Cancel a remove friend request
static async cancelRemoveFriend(userId, friendId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [friendship] = await connection.query(
      `SELECT id FROM friendships 
       WHERE ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)) 
       AND status = 'pending_removal'`,
      [userId, friendId, friendId, userId]
    );

    if (friendship.length === 0) {
      await connection.rollback();
      throw { message: 'لا يوجد طلب إزالة صداقة قيد الانتظار' };
    }

    await connection.query(
      'UPDATE friendships SET status = "active", requested_by = NULL WHERE id = ?',
      [friendship[0].id]
    );

    await connection.commit();
    return { id: friendship[0].id };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

static async acceptRemoveFriend(userId, friendId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [friendship] = await connection.query(
      `SELECT id FROM friendships 
       WHERE ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)) 
       AND status = 'pending_removal'`,
      [userId, friendId, friendId, userId]
    );

    if (friendship.length === 0) {
      await connection.rollback();
      throw { message: 'لا يوجد طلب إزالة صداقة قيد الانتظار' };
    }

    await connection.execute(
      `DELETE FROM matches 
       WHERE (player1_id = ? AND player2_id = ?) 
          OR (player1_id = ? AND player2_id = ?)`,
      [userId, friendId, friendId, userId]
    );

    await connection.query(
      'DELETE FROM friendships WHERE id = ?',
      [friendship[0].id]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Reject a remove friend request
static async rejectRemoveFriend(userId, friendId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [friendship] = await connection.query(
      `SELECT id FROM friendships 
       WHERE ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)) 
       AND status = 'pending_removal'`,
      [userId, friendId, friendId, userId]
    );

    if (friendship.length === 0) {
      await connection.rollback();
      throw { message: 'لا يوجد طلب إزالة صداقة قيد الانتظار' };
    }

    await connection.query(
      'UPDATE friendships SET status = "active", requested_by = NULL WHERE id = ?',
      [friendship[0].id]
    );

    await connection.commit();
    return { id: friendship[0].id };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Get friend details
static async getFriendDetails(userId, friendId) {
  const [rows] = await pool.query(`
    SELECT u.id, u.name_account, u.id_account, f.status, f.created_at
    FROM friendships f
    JOIN users u ON u.id = ?
    WHERE 
      ((f.user1_id = ? AND f.user2_id = ?) OR (f.user1_id = ? AND f.user2_id = ?))
      AND f.status = 'active'
    LIMIT 1
  `, [friendId, userId, friendId, friendId, userId]);

  return rows.length > 0 ? rows[0] : null;
}

}

module.exports = friendModel;

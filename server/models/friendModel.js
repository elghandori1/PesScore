const pool = require('../config/db');

class friendModel {
  static async searchFriend(userId,query) {
   
    const [users] = await pool.query(
      'SELECT  id, name_account , id_account FROM users WHERE (name_account = ? OR id_account = ?) AND id != ?',
      [query, query, userId]
    );
    return users; 
  }

  static async addFriend(senderId, receiverId) {
    // Check if the friend request already exists
    const [existingRequest] = await pool.query(
      'SELECT * FROM friend_requests WHERE sender_id = ? AND receiver_id = ?',
      [senderId, receiverId]
    );

    if (existingRequest.length > 0) {
      throw { message: 'تم إرسال طلب صداقة مسبقًا' };
    }

    // Insert the new friend request
    await pool.query(
      'INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, ?)',
      [senderId, receiverId, 'pending']
    );

    // Get the name of the user who sent the request
    const [user] = await pool.query(
      'SELECT name_account FROM users WHERE id = ?',
      [senderId]
    );

    return { name: user[0].name_account };
  }
  
  static async pending_requests(userId) {
    const [user] = await pool.query(
      `SELECT fr.id, fr.receiver_id, u.name_account, id_account ,u.created_at
      FROM friend_requests fr
      JOIN users u ON fr.receiver_id = u.id
      WHERE fr.sender_id = ? AND fr.status = 'pending'`, [userId]);
    return user;
  }

  static async cancel_Request(senderId, requestId) {
        const [result] = await pool.query(
      'DELETE FROM friend_requests WHERE id = ? AND sender_id = ? AND status = "pending"',
      [requestId, senderId]
    );
    return result;
  }

}

module.exports = friendModel;

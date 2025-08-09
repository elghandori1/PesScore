const pool = require("../config/db");

class matchModel {
static async createMatch({ player1_id, player2_id, player1_score, player2_score, created_by }) {
  const connection = await pool.getConnection();
  
  try {
    let winner_id = null;
    if (player1_score > player2_score) {
      winner_id = player1_id;
    } else if (player2_score > player1_score) {
      winner_id = player2_id;
    }

    // First insert the match
    const [result] = await connection.execute(
      `
      INSERT INTO matches
        (player1_id, player2_id, player1_score, player2_score, winner_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [player1_id, player2_id, player1_score, player2_score, winner_id, created_by]
    );

    // Then fetch the newly created match
    const [matches] = await connection.execute(
      `SELECT * FROM matches WHERE id = ?`,
      [result.insertId]
    );

    return matches[0]; // Return the created match object
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
}

static async getPendingSentMatches(userId, friendId) {
  const [rows] = await pool.query(
    `
    SELECT m.*, u.name_account AS opponent_name
    FROM matches m
    JOIN users u ON u.id = m.player2_id
    WHERE m.created_by = ? AND m.player2_id = ? AND m.status = 'pending'
    ORDER BY m.match_date DESC
    `,
    [userId, friendId]
  );
  return rows;
}

static async getPendingReceivedMatches(userId, friendId) {
  const [rows] = await pool.query(
    `
    SELECT m.*, u.name_account AS opponent_name
    FROM matches m
    JOIN users u ON u.id = m.created_by
    WHERE m.player2_id = ? AND m.created_by = ? AND m.status = 'pending'
    ORDER BY m.match_date DESC
    `,
    [userId, friendId]
  );
  return rows;
}

static async getrejectedsentmatches(userId, friendId) { 
  const [rows] = await pool.query(
    `
    SELECT m.*, u.name_account AS opponent_name
    FROM matches m
    JOIN users u ON u.id = CASE
      WHEN m.created_by = ? THEN m.player2_id
      ELSE m.created_by
    END
    WHERE (
      (m.player1_id = ? AND m.player2_id = ?) OR 
      (m.player2_id = ? AND m.player1_id = ?)
    ) 
    AND m.status = 'rejected'
    ORDER BY m.match_date DESC
    `,
    [userId, userId, friendId, userId, friendId]
  );
  return rows;
}

  static async getMatchById(matchId) {
    const [rows] = await pool.query(`SELECT * FROM matches WHERE id = ?`, [matchId]);
    return rows[0];
  }

static async acceptMatch(matchId) {
  await pool.query(
    `UPDATE matches SET status = 'confirmed', match_date = NOW() WHERE id = ?`,
    [matchId]
  );
}

  static async rejectMatch(matchId) {
    await pool.query(`UPDATE matches SET status = 'rejected', match_date = NOW() WHERE id = ?`, [matchId]);
  }

  static async cancelMatch(matchId) {
    await pool.query(`DELETE FROM matches WHERE id = ?`, [matchId]);
  }

static async resendmatchrequest(matchId){
    await pool.query(
      `UPDATE matches SET status = 'pending', match_date = NOW() WHERE id = ?`,
      [matchId]
    );
}

static async cancelrejectedmatch(matchId){
      await pool.query(
      `UPDATE matches SET status = 'pending', match_date = NOW() WHERE id = ?`,
      [matchId]
    );
}

static async getMatchesBetweenUsers(userId, friendId) {
  const sql = `
    SELECT 
      m.id, m.player1_id, m.player2_id, 
      m.player1_score, m.player2_score,
      m.status, m.match_date, m.created_by,
      m.removed, m.removal_requested_by,
      u1.name_account AS player1_name,
      u2.name_account AS player2_name
    FROM matches m
    JOIN users u1 ON m.player1_id = u1.id
    JOIN users u2 ON m.player2_id = u2.id
    WHERE ((m.player1_id = ? AND m.player2_id = ?) 
       OR (m.player1_id = ? AND m.player2_id = ?))
       AND m.status = 'confirmed'
    ORDER BY m.match_date DESC
  `;
  const [rows] = await pool.query(sql, [
    userId, friendId, friendId, userId
  ]);
  return rows;
}

static async removematche(matchId, userId) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `UPDATE matches 
       SET removed = 'pending_remove', 
           removal_requested_by = ? 
       WHERE id = ? AND removed = 'no'`,
      [userId, matchId]
    );
  } finally {
    connection.release();
  }
}

static async acceptRemoveMatch(matchId) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `DELETE FROM matches WHERE id = ? AND removed = 'pending_remove'`,
      [matchId]
    );
  } finally {
    connection.release();
  }
}

static async rejectRemoveMatch(matchId) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `UPDATE matches 
       SET removed = 'no', 
           removal_requested_by = NULL 
       WHERE id = ? AND removed = 'pending_remove'`,
      [matchId]
    );
  } finally {
    connection.release();
  }
}

static async cancelRemoveMatch(matchId) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `UPDATE matches SET removed = 'no' WHERE id = ? AND removed = 'pending_remove'`,
      [matchId]
    );
  } finally {
    connection.release();
  }
}

  static async notfiPendingSentMatches(userId) {
    const [rows] = await pool.query(
      `
      SELECT m.*, u.name_account AS opponent_name
      FROM matches m
      JOIN users u ON u.id = m.player2_id
      WHERE m.created_by = ? AND m.status = 'pending'
      ORDER BY m.match_date DESC
      `,
      [userId]
    );
    return rows;
  }

  static async notifPendingReceivedMatches(userId) {
    const [rows] = await pool.query(
      `
      SELECT m.*, u.name_account AS opponent_name
      FROM matches m
      JOIN users u ON u.id = m.created_by
      WHERE m.player2_id = ? AND m.status = 'pending'
      ORDER BY m.match_date DESC
      `,
      [userId]
    );
    return rows;
  }

  static async notifrejectedsentmatches(userId) { 
  const [rows] = await pool.query(
`
      SELECT m.*, u.name_account AS opponent_name
      FROM matches m
      JOIN users u ON u.id = CASE
        WHEN m.created_by = ? THEN m.player2_id
        ELSE m.created_by
      END
      WHERE (m.player1_id = ? OR m.player2_id = ?) AND m.status = 'rejected'
      ORDER BY m.match_date DESC
      `,
      [userId, userId, userId]
  );
  return rows;
}
}

module.exports = matchModel;

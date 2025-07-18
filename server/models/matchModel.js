const pool = require("../config/db");

class matchModel {
  static async createMatch({player1_id, player2_id, player1_score, player2_score,created_by,}) 
  {
    const connection = await pool.getConnection();

    try {
     let winner_id = null;
    if (player1_score > player2_score) {
      winner_id = player1_id;
    } else if (player2_score > player1_score) {
      winner_id = player2_id;
    }
      await connection.execute(
        `
        INSERT INTO matches
          (player1_id, player2_id, player1_score, player2_score, winner_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          player1_id, player2_id, player1_score,
          player2_score, winner_id, created_by,
        ]
      );
      connection.release();
    } catch (err) {
      connection.release();
      throw err;
    } finally {
    connection.release(); 
  }
  }

    static async getPendingSentMatches(userId) {
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

  static async getPendingReceivedMatches(userId) {
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

static async getrejectedsentmatches(userId) {
  const [rows] = await pool.query(
    `
    SELECT m.*, u.name_account AS opponent_name
    FROM matches m
    JOIN users u ON u.id = IF(m.created_by = ?, m.player2_id, m.created_by)
    WHERE (m.player1_id = ? OR m.player2_id = ?) AND m.status = 'rejected'
    ORDER BY m.match_date DESC
    `,
    [userId, userId, userId]
  );
  return rows;
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

}

module.exports = matchModel;

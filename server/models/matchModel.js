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
}

module.exports = matchModel;

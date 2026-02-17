const bcrypt = require('bcryptjs');
const pool = require('../config/db');

class AuthModel {
  static async createUser(name_account, id_account, password_hash) {
    const hashedPassword = await bcrypt.hash(password_hash, 10);
    await pool.query(
      'INSERT INTO users (name_account, id_account, password_hash) VALUES (?, ?, ?)',
      [name_account, id_account, hashedPassword]
    );
  }

  static async findByID_Compte(ID_Compte) {
    const [users] = await pool.query('SELECT * FROM users WHERE id_account = ?', [ID_Compte]);
    return users[0]; // return the first user or undefined
  }



  static async findById(id) {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0];
  }

  static async comparePasswords(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword);
  }
}

module.exports = AuthModel;

const bcrypt = require('bcryptjs');
const pool = require('../config/db');

class AdminModel {
  static async createAdmin(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO admin (username, password_hash) VALUES (?, ?)',
      [username, hashedPassword]
    );
  }

  static async findByUsername(username) {
    const [admins] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);
    return admins[0];
  }

  static async checkAdminExists() {
    const [admins] = await pool.query('SELECT COUNT(*) as count FROM admin');
    return admins[0].count > 0;
  }

  static async getAllUsers() {
    const [users] = await pool.query('SELECT id, name_account, id_account, created_at FROM users');
    return users;
  }

  static async getUserCount() {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM users');
    return result[0].count;
  }

  static async comparePasswords(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword);
  }
}

module.exports = AdminModel;

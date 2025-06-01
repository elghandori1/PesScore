const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:'localhost',
  user: 'root',
  password: 'MySecurePass!2025',
  database: 'PesScore',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then((connection) => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });

module.exports = pool;
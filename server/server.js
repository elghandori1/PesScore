const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const session = require('express-session');

// CORS options
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

app.use(
  session({
    secret: "superSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Create MySQL connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "MySecurePass!2025",
  database: "PesScore",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test DB connection on startup
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Database connected successfully");
    connection.release();
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Error: All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Error: Invalid email format" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Error: Password must be at least 8 characters" });
  }

  try {
    const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hashed);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }

    // Set session user ID
    req.session.userId = user.id;
    res.status(200).json({ user: { name: user.name } });

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Register endpoint
app.post("/register", async (req, res) => {
  const { name, account_name, email, password } = req.body;

  // Check if any field is missing
  if (!name || !account_name || !email || !password) {
    return res.status(400).json({ message: "Error: All fields are required" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Error: Invalid email format" });
  }

  // Validate password length
  if (password.length < 8) {
    return res.status(400).json({ message: "Error: Password must be at least 8 characters" });
  }

  try {
    const checkSql = `
      SELECT * FROM users WHERE email = ? OR account_name = ?
    `;
    const [rows] = await new Promise((resolve, reject) => {
      db.query(checkSql, [email, account_name], (err, result) => {
        if (err) reject(err);
        resolve([result]);
      });
    });

    if (rows.length > 0) {
      return res.status(400).json({ message: "Error: Account already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert into database
    const insertSql = `
      INSERT INTO users (name, account_name, email, password_hashed)
      VALUES (?, ?, ?, ?)
    `;

    await new Promise((resolve, reject) => {
      db.query(insertSql, [name, account_name, email, hashedPassword], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    res.status(201).json({ message: "registered successfully!" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/auth", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const userId = req.session.userId;

  db.query("SELECT id, name FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];
    res.json({ user });
  });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Could not log out" });
    }

    res.clearCookie('connect.sid');

    res.json({ message: "Logout successful" });
  });
});

app.get("/profile", (req, res) => {

  const userId = req.session.userId;

  db.query(
    "SELECT name, account_name, email, created_at FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user: results[0] });
    }
  );
});

// GET /search-users?query=username
app.get('/search-users', (req, res) => {
  const query = req.query.query;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  db.query(
    `SELECT id, account_name FROM users 
     WHERE account_name = ? AND id != ?`,
     [query, userId]
     ,
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      res.json({ users: results });
    }
  );
});

// POST /send-request
app.post('/send-request', (req, res) => {
  const userId = req.session.userId;
  const { friend_id } = req.body;

  if (!userId || !friend_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  // Prevent self-friendship
  if (userId === friend_id) {
    return res.status(400).json({ message: "error same account" });
  }
  // Check if friendship already exists
  const checkSql = `
    SELECT * FROM friendships 
    WHERE (user_id = ? AND friend_id = ?)
  `;

  db.query(checkSql, [userId, friend_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Insert new friend request
    const insertSql = `
      INSERT INTO friendships (user_id, friend_id, status)
      VALUES (?, ?, 'pending')
    `;

    db.query(insertSql, [userId, friend_id], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      res.json({ message: "Friend request sent successfully" });
    });
  });
});

// GET /pending-requests
app.get('/pending-requests', (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const sql = `
    SELECT u.id, u.account_name 
    FROM friendships f
    JOIN users u ON f.friend_id = u.id
    WHERE f.user_id = ? AND f.status = 'pending'
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.json({ pending: results });
  });
});

// DELETE /friendships/:friendId (cancel pending request)
app.delete('/friendships/:friendId', (req, res) => {
  const userId = req.session.userId;
  const friendId = req.params.friendId;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const sql = `
    DELETE FROM friendships 
    WHERE user_id = ? AND friend_id = ? AND status = 'pending'
  `;

  db.query(sql, [userId, friendId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No pending request found" });
    }

    res.json({ success: true });
  });
});

// Start server
const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
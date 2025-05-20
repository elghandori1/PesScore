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
  if(account_name.length >10){
    return res.status(400).json({ message: "Error: Maximum 10 characters for Account Name" });
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
      return res.status(400).json({ message: "Account already exists change Email or Account Name" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
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

function ensureAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

app.get("/auth",ensureAuthenticated, (req, res) => {

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

  if (userId === friend_id) {
    return res.status(400).json({ message: "You cannot add yourself." });
  }

  // Check for existing friendship or reverse pending request
  const checkSql = `
    SELECT * FROM friendships 
    WHERE (user_id = ? AND friend_id = ?) 
       OR (user_id = ? AND friend_id = ?)
  `;

  db.query(checkSql, [userId, friend_id, friend_id, userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length > 0) {
      const existing = results[0];

      // Case: Already friends
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: "You are already friends." });
      }

      // Case: You already sent a request
      if (existing.user_id === userId && existing.status === 'pending') {
        return res.status(400).json({ message: "Friend request already pending." });
      }

      // Case: They sent you a request => Auto-accept it
      if (existing.user_id === friend_id && existing.friend_id === userId && existing.status === 'pending') {
        const updateSql = `
          UPDATE friendships 
          SET status = 'accepted' 
          WHERE user_id = ? AND friend_id = ?
        `;
        return db.query(updateSql, [friend_id, userId], (err) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Internal server error" });
          }

          return res.json({ message: "Friend request accepted automatically." });
        });
      }

      return res.status(400).json({ message: "Friendship request conflict." });
    }

    // Insert new request
    const insertSql = `
      INSERT INTO friendships (user_id, friend_id, status)
      VALUES (?, ?, 'pending')
    `;

    db.query(insertSql, [userId, friend_id], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      res.json({ message: "Friend request sent successfully." });
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

app.get("/friends", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const sql = `
    SELECT u.id, u.name, u.account_name FROM users u
    JOIN friendships f ON (
        (f.user_id = ? AND f.friend_id = u.id)
        OR (f.friend_id = ? AND f.user_id = u.id)
    )
    WHERE f.status = 'accepted' ORDER BY f.accepted_at DESC
  `;

  db.query(sql, [userId, userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.json({ friends: results });
  });
});

app.get("/friend-requests", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const sql = `
    SELECT u.id, u.name, u.account_name FROM users u
    JOIN friendships f ON f.user_id = u.id
    WHERE f.friend_id = ? AND f.status = 'pending' ORDER BY f.requested_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.json({ pendingRequests: results });
  });
});

app.post("/accept-request", (req, res) => {
  const { requesterId } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const sql = `
    UPDATE friendships SET status = 'accepted', accepted_at = NOW()
    WHERE user_id = ? AND friend_id = ? AND status = 'pending'
  `;

  db.query(sql, [requesterId, userId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No pending request found" });
    }

    res.json({ message: "Friend request accepted" });
  });
});

app.delete("/remove-friend", (req, res) => {
  const userId = req.session.userId;
  const { friendId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!friendId) {
    return res.status(400).json({ message: "Missing friend ID" });
  }

  // First delete all matches between these two users
  const deleteMatchesSql = `
    DELETE FROM matches
    WHERE (user1_id = ? AND user2_id = ?)
       OR (user1_id = ? AND user2_id = ?)
  `;

  db.query(deleteMatchesSql, [userId, friendId, friendId, userId], (matchErr, matchResult) => {
    if (matchErr) {
      console.error("Error deleting matches:", matchErr);
      return res.status(500).json({ message: "Failed to delete match history" });
    }

    // Then delete the friendship
    const deleteFriendshipSql = `
      DELETE FROM friendships
      WHERE (
        (user_id = ? AND friend_id = ?)
        OR (user_id = ? AND friend_id = ?)
      )
      AND status = 'accepted'
    `;

    db.query(deleteFriendshipSql, [userId, friendId, friendId, userId], (friendErr, friendResult) => {
      if (friendErr) {
        console.error("Database error:", friendErr);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (friendResult.affectedRows === 0) {
        return res.status(400).json({ message: "No accepted friendship found" });
      }

      res.json({
        message: "Friend and all related match data removed successfully"
      });
    });
  });
});

app.delete("/reject-friend", (req, res) => {
  const userId = req.session.userId;
  const { friendId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (!friendId) {
    return res.status(400).json({ message: "Missing friend ID" });
  }

  const sql = `
    DELETE FROM friendships
    WHERE friend_id = ? AND user_id = ? AND status = 'pending'
  `;

  db.query(sql, [userId, friendId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No pending request found" });
    }

    res.json({ message: "Friend request rejected" });
  });
});

app.get("/friends-score/:id", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const friendId = req.params.id;
  const sql = `
    SELECT * FROM users
    WHERE id = ?
    AND id IN (
      SELECT CASE WHEN user_id = ? THEN friend_id ELSE user_id END
      FROM friendships
      WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
    )
  `;

  db.query(sql, [friendId, userId, userId, userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Friend not found or not accepted" });
    }

    res.json({ friend: results[0] });
  });
});

// Get matches between users (both pending and accepted)
app.get("/matches-score/:friendId", async (req, res) => {
  const userId = req.session.userId;
  const friendId = req.params.friendId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Verify friendship
    const [friendship] = await db.promise().query(
      `SELECT * FROM friendships 
       WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) 
       AND status = 'accepted'`,
      [userId, friendId, friendId, userId]
    );

    if (friendship.length === 0) {
      return res.status(403).json({ error: "You can only view matches with friends" });
    }

    // Get all matches between these users
    const [matches] = await db.promise().query(
      `SELECT * FROM matches
       WHERE ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?))
       ORDER BY date_time DESC`,
      [userId, friendId, friendId, userId]
    );

    res.json({ matches });
  } catch (err) {
    console.error("Error fetching matches:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new match request
app.post("/new-matches", async (req, res) => {
  const userId = req.session.userId;
  const { opponent_id, user_score, opponent_score } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Verify friendship exists
    const [friendship] = await db.promise().query(
      `SELECT * FROM friendships 
       WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) 
       AND status = 'accepted'`,
      [userId, opponent_id, opponent_id, userId]
    );

    if (friendship.length === 0) {
      return res.status(403).json({ error: "You can only create matches with friends" });
    }

    // Create new match request
    const [result] = await db.promise().query(
      `INSERT INTO matches 
       (user1_id, user2_id, user1_score, user2_score, requester_id, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [userId, opponent_id, user_score, opponent_score, userId]
    );

    res.json({ 
      message: "Match request sent successfully",
      match_id: result.insertId
    });
  } catch (err) {
    console.error("Error creating match request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/match-requests", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const sql = `
    SELECT * FROM matches
    WHERE ((user1_id = ? OR user2_id = ?) AND status = 'pending')
      AND requester_id != ?
  `;

  db.query(sql, [userId, userId, userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.json({ pendingMatch: results });
  });
});

// Cancel a pending match (only by requester)
app.delete("/matches/:matchId/cancel", async (req, res) => {
  const userId = req.session.userId;
  const matchId = req.params.matchId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Verify the user is the requester of this pending match
    const [match] = await db.promise().query(
      `SELECT * FROM matches 
       WHERE match_id = ? 
       AND requester_id = ? 
       AND status = 'pending'`,
      [matchId, userId]
    );

    if (match.length === 0) {
      return res.status(404).json({ error: "Match request not found or you don't have permission to cancel it" });
    }

    // Delete the match request
    await db.promise().query(
      `DELETE FROM matches WHERE match_id = ?`,
      [matchId]
    );

    res.json({ message: "Match request canceled successfully" });
  } catch (err) {
    console.error("Error canceling match:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Accept a pending match (by receiver)
app.post("/matches/:matchId/accept", async (req, res) => {
  const userId = req.session.userId;
  const matchId = req.params.matchId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Verify the user is the receiver of this pending match
    const [match] = await db.promise().query(
      `SELECT * FROM matches 
       WHERE match_id = ? 
       AND requester_id != ? 
       AND status = 'pending'
       AND (user1_id = ? OR user2_id = ?)`,
      [matchId, userId, userId, userId]
    );

    if (match.length === 0) {
      return res.status(404).json({ error: "Match request not found or you don't have permission to accept it" });
    }

    // Update match status to accepted
    await db.promise().query(
      `UPDATE matches SET status = 'accepted' WHERE match_id = ?`,
      [matchId]
    );

    res.json({ message: "Match accepted successfully" });
  } catch (err) {
    console.error("Error accepting match:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reject a pending match (by receiver)
app.post("/matches/:matchId/reject", async (req, res) => {
  const userId = req.session.userId;
  const matchId = req.params.matchId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Verify the user is the receiver of this pending match
    const [match] = await db.promise().query(
      `SELECT * FROM matches 
       WHERE match_id = ? 
       AND requester_id != ? 
       AND status = 'pending'
       AND (user1_id = ? OR user2_id = ?)`,
      [matchId, userId, userId, userId]
    );

    if (match.length === 0) {
      return res.status(404).json({ error: "Match request not found or you don't have permission to reject it" });
    }

    // Update match status to rejected
    await db.promise().query(
      `UPDATE matches SET status = 'rejected' WHERE match_id = ?`,
      [matchId]
    );

    res.json({ message: "Match rejected successfully" });
  } catch (err) {
    console.error("Error rejecting match:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Start server
const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const friendRoutes = require('./routes/friendRoutes');
const matchRoutes = require('./routes/matchRoutes');

const app = express();

// Create HTTP server and attach Socket.IO
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Attach io to app
app.set('io', io);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Routes
app.use('/auth', authRoutes);
app.use('/user', profileRoutes);
app.use('/friend', friendRoutes);
app.use('/match', matchRoutes);

// Socket.IO events (optional)
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

    socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
  });

  socket.on("disconnect", () => {
  console.log("Socket disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

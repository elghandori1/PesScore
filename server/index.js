const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const profile = require('./routes/profileRoutes');
const friendRoutes = require('./routes/friendRoutes');
const matchRoutes = require("./routes/matchRoutes");
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Routes
app.use('/auth', authRoutes);
app.use('/user', profile);
app.use('/friend', friendRoutes);
app.use('/match',matchRoutes);

const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

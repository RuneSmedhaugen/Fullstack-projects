const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const bossRoutes = require('./routes/bossRoutes');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userItemsRoutes = require('./routes/userItemsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const friendsRoutes = require('./routes/FriendsRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.send('API is running');
});
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/bosses', bossRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/useritems', userItemsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/friends', friendsRoutes);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust the origin as needed
    methods: ["GET", "POST"]
  }
});

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Example: join a room by user id (for targeted notifications)
  socket.on('join', (userId) => {
    console.log(`Socket ${socket.id} joining room: user_${userId}`);
    socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Export the io instance if you need it in other modules (like controllers)
module.exports.io = io;

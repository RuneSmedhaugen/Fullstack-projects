const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const bossRoutes = require('./routes/bossRoutes');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userItemsRoutes = require('./routes/userItemsRoutes');

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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} test`);
});

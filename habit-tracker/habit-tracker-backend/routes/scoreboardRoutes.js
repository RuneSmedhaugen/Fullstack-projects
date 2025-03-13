const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getGlobalScoreboard, getFriendScoreboard } = require('../controllers/scoreboardController');

router.get('/global', authMiddleware, getGlobalScoreboard);
router.get('/friends', authMiddleware, getFriendScoreboard);

module.exports = router;

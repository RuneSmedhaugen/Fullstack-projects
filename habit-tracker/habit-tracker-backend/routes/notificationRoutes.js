const express = require('express');
const router = express.Router();
const {
    sendFriendRequest,
    respondToFriendRequest,
    getFriendRequests
} = require('../controllers/notificationsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/sendFriendRequest', authMiddleware , sendFriendRequest);

router.post('/respond', authMiddleware, respondToFriendRequest);

router.get('/friend-requests', authMiddleware, getFriendRequests)

module.exports = router;

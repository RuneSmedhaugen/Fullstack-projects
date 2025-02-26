const express = require('express');
const router = express.Router();
const {
    sendFriendRequest,
    respondToFriendRequest,
    getUserNotifications,
    markNotificationAsSeen
} = require('../controllers/notificationsController');
const authenticate = require('../middleware/authMiddleware'); // Assuming you have authentication middleware

router.post('/friend-request', authenticate, sendFriendRequest);
router.post('/respond', authenticate, respondToFriendRequest);
router.get('/', authenticate, getUserNotifications);
router.post('/mark-seen', authenticate, markNotificationAsSeen);

module.exports = router;

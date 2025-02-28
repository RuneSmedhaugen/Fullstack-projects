const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');

// Add a friend
router.post('/add', friendsController.addFriend);

// Get friend list
router.get('/:userId', friendsController.getFriendList);

// Delete a friend
router.delete('/:userId/:friendId', friendsController.deleteFriend);

module.exports = router;

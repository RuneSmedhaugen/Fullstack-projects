const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, deleteUserAccount } = require('../controllers/userController');


router.get('/profile', authMiddleware, getUserProfile);

router.put('/profile', authMiddleware, updateUserProfile);

router.delete('/profile', authMiddleware, deleteUserAccount);
module.exports = router;

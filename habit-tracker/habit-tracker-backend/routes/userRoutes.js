const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, deleteUserAccount, getAllUsers, getUserById } = require('../controllers/userController');


router.get('/profile', authMiddleware, getUserProfile);

router.put('/profile', authMiddleware, updateUserProfile);

router.delete('/profile', authMiddleware, deleteUserAccount);

router.get('/', authMiddleware, getAllUsers);

router.get('/:id', authMiddleware, getUserById);

module.exports = router;


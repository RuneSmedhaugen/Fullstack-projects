const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getHabits, addHabit, updateHabit, deleteHabit } = require('../controllers/habitController');

router.get('/', authMiddleware, getHabits);
router.post('/', authMiddleware, addHabit);
router.put('/:id', authMiddleware, updateHabit);
router.delete('/:id', authMiddleware, deleteHabit);

module.exports = router;
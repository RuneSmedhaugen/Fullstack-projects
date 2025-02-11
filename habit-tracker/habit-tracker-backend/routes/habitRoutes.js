const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const authMiddleware = require('../middleware/authMiddleware');
const {
    getHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    markHabitDone,
    getStats,
    getCompletionData,
} = require('../controllers/habitController');

// Get completion data
router.get('completions', authMiddleware, getCompletionData);

// Get user stats
router.get('/stats', authMiddleware, getStats);

// Get all habits
router.get('/', authMiddleware, getHabits);

// Create a new habit
router.post('/', authMiddleware, addHabit);

// Update a habit
router.put('/:id', authMiddleware, updateHabit);

// Delete a habit
router.delete('/:id', authMiddleware, deleteHabit);

// Mark habit as done 
router.post('/:habitId/completion', authMiddleware, markHabitDone);

// Get today's completions for the user
router.get('/completions', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT hc.* FROM habit_completions hc
       JOIN habits h ON hc.habit_id = h.id
       WHERE h.user_id = $1 AND DATE(hc.done_at) = CURRENT_DATE`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching completions:", error);
        res.status(500).json({ message: 'Error fetching completions' });
    }
});

module.exports = router;

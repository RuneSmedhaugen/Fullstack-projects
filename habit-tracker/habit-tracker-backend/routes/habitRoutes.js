const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getHabits,
  addHabit,           
  updateHabit,
  deleteHabit,
  markHabitDone,
  getStats,
  getCompletionData,
  getFullStats,
  getYearlyCompletionData,
  getWeeklyCompletionData,
  getMonthlyCompletionData,
  addDailyHabit,
  addWeeklyHabit,
  addMonthlyHabit,
  addYearlyHabit,
} = require('../controllers/habitController');

// Separate add endpoints by time perspective
router.post('/daily', authMiddleware, addDailyHabit);
router.post('/weekly', authMiddleware, addWeeklyHabit);
router.post('/monthly', authMiddleware, addMonthlyHabit);
router.post('/yearly', authMiddleware, addYearlyHabit);

// Other routes
router.get('/fullstats', authMiddleware, getFullStats);
router.get('/completions', authMiddleware, getCompletionData);
router.get('/stats', authMiddleware, getStats);
router.get('/habits', authMiddleware, getHabits);
router.put('/:id', authMiddleware, updateHabit);
router.delete('/:id', authMiddleware, deleteHabit);
router.post('/:habitId/completion', authMiddleware, markHabitDone);

// Optionally, if you need completions endpoints by period, you can add:
router.get('/completions/yearly', authMiddleware, getYearlyCompletionData);
router.get('/completions/weekly', authMiddleware, getWeeklyCompletionData);
router.get('/completions/monthly', authMiddleware, getMonthlyCompletionData);

module.exports = router;

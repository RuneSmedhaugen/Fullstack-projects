const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getHabits,
  addHabit,           
  updateHabit,
  deleteHabit,
  markHabitDone,
  getCompletionData,
  getFullStats,
  getYearlyCompletionData,
  getWeeklyCompletionData,
  getMonthlyCompletionData,
  addDailyHabit,
  addWeeklyHabit,
  addMonthlyHabit,
  addYearlyHabit,
  unmarkHabitDone,
  getHabitCompletions,
} = require('../controllers/habitController');

// Separate add endpoints by time perspective
router.post('/daily', authMiddleware, addDailyHabit);
router.post('/weekly', authMiddleware, addWeeklyHabit);
router.post('/monthly', authMiddleware, addMonthlyHabit);
router.post('/yearly', authMiddleware, addYearlyHabit);

// Other routes
router.get('/stats', authMiddleware, getFullStats);
router.get('/completions', authMiddleware, getCompletionData);
router.get('/', authMiddleware, getHabits);
router.put('/:id', authMiddleware, updateHabit);
router.delete('/:id', authMiddleware, deleteHabit);

router.get('/get-completions', authMiddleware, getHabitCompletions);
router.post('/mark-done/:habitId', authMiddleware, markHabitDone);
router.delete('/unmark-done/:habitId', authMiddleware, unmarkHabitDone);


router.get('/completions/yearly', authMiddleware, getYearlyCompletionData);
router.get('/completions/weekly', authMiddleware, getWeeklyCompletionData);
router.get('/completions/monthly', authMiddleware, getMonthlyCompletionData);

module.exports = router;

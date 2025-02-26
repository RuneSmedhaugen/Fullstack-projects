const pool = require('../models/db');
const { checkLevelUp } = require('./userController');

// -----------------------
// Retrieval, Update, Delete, etc.
// -----------------------

// Get all habits for a user
const getHabits = async (req, res) => {
  const userId = req.user.id;
  console.log('Fetching habits for user ID:', userId);
  try {
    const result = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC',
      [userId]
    );
    console.log('Habits retrieved:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting habits:', err);
    res.status(500).json({ message: 'Server error retrieving habits.' });
  }
};

// Default add habit (uses time_perspective from payload)
const addHabit = async (req, res) => {
  const userId = req.user.id;
  const { name, description, purpose, time_perspective, xp_reward, gold_reward } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO habits 
         (user_id, name, description, purpose, streak_current, streak_longest, time_perspective, xp_reward, gold_reward) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [userId, name, description || '', purpose || '', 0, 0, time_perspective || 'daily', xp_reward || 10, gold_reward || 100]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding habit:', error);
    res.status(500).json({ message: 'Server error creating habit.' });
  }
};

// Shared function to add a habit by type
async function addHabitByType(req, res, type) {
  const userId = req.user.id;
  const { name, description, purpose } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO habits 
         (user_id, name, description, purpose, streak_current, streak_longest, time_perspective, xp_reward, gold_reward) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [userId, name, description || '', purpose || '', 0, 0, type, 10, 100]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`Error adding ${type} habit:`, error);
    res.status(500).json({ message: `Server error creating ${type} habit.` });
  }
}

// Separate endpoints for each time perspective
const addDailyHabit = (req, res) => addHabitByType(req, res, 'daily');
const addWeeklyHabit = (req, res) => addHabitByType(req, res, 'weekly');
const addMonthlyHabit = (req, res) => addHabitByType(req, res, 'monthly');
const addYearlyHabit = (req, res) => addHabitByType(req, res, 'yearly');

// Update a habit
const updateHabit = async (req, res) => {
  const userId = req.user.id;
  const habitId = req.params.id;
  const { name, description, purpose, time_perspective, streak_current, streak_longest, xp_reward, gold_reward } = req.body;
  try {
    const result = await pool.query(
      `UPDATE habits 
       SET name = $1, description = $2, purpose = $3, time_perspective = $4, 
           streak_current = $5, streak_longest = $6, xp_reward = $7, gold_reward = $8 
       WHERE id = $9 AND user_id = $10 
       RETURNING *`,
      [name, description, purpose, time_perspective, streak_current, streak_longest, xp_reward, gold_reward, habitId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Server error updating habit.' });
  }
};

// Delete a habit
const deleteHabit = async (req, res) => {
  const userId = req.user.id;
  const habitId = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING *',
      [habitId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }
    res.json({ message: 'Habit deleted successfully', habit: result.rows[0] });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Server error deleting habit.' });
  }
};

// Mark a habit as done
const markHabitDone = async (req, res) => {
  const { habitId } = req.params;
  const userId = req.user.id;
  try {
    const habitResult = await pool.query(
      'SELECT xp_reward, gold_reward FROM habits WHERE id = $1 AND user_id = $2',
      [habitId, userId]
    );
    if (habitResult.rowCount === 0) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }
    const habit = habitResult.rows[0];
    const completionResult = await pool.query(
      'INSERT INTO habit_completions (habit_id) VALUES ($1) RETURNING *',
      [habitId]
    );
    await pool.query(
      `UPDATE users 
       SET xp = xp + $1, gold = gold + $2 
       WHERE id = $3`,
      [habit.xp_reward, habit.gold_reward, userId]
    );
    res.status(201).json({
      message: 'Habit marked as done, rewards granted',
      completion: completionResult.rows[0],
      xp_reward: habit.xp_reward,
      gold_reward: habit.gold_reward
    });
  } catch (error) {
    console.error("Error marking habit as done:", error);
    res.status(500).json({ message: "Error marking habit as done" });
  }
};

// -----------------------
// Stats and Completion Data
// -----------------------

// Basic stats about habits and completions
const getStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const totalHabitsResult = await pool.query('SELECT COUNT(*) FROM habits WHERE user_id = $1', [userId]);
    const totalCompletionsResult = await pool.query(
      `SELECT COUNT(*) FROM habit_completions hc 
       JOIN habits h ON hc.habit_id = h.id 
       WHERE h.user_id = $1`,
      [userId]
    );
    const longestStreakResult = await pool.query(
      `WITH streaks AS (
         SELECT done_at::date AS completion_date, 
                LAG(done_at::date) OVER (ORDER BY done_at::date) AS prev_date
         FROM habit_completions hc
         JOIN habits h ON hc.habit_id = h.id
         WHERE h.user_id = $1
       )
       SELECT MAX(streak_length) AS longest_streak FROM (
         SELECT completion_date, COUNT(*) AS streak_length 
         FROM streaks 
         WHERE completion_date = prev_date + INTERVAL '1 day'
         GROUP BY completion_date
       ) subquery`,
      [userId]
    );
    const stats = {
      totalHabits: parseInt(totalHabitsResult.rows[0].count, 10),
      totalCompletions: parseInt(totalCompletionsResult.rows[0].count, 10),
      longestStreak: longestStreakResult.rows[0]?.longest_streak || 0,
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
};

// Daily completion data for the last 7 days
const getCompletionData = async (req, res) => {
  const userId = req.user.id;
  console.log('Fetching daily completion data for user ID:', userId);
  try {
    const dailyCompletions = await pool.query(
      `SELECT done_at::date AS date, COUNT(*) AS completions 
       FROM habit_completions hc 
       JOIN habits h ON hc.habit_id = h.id 
       WHERE h.user_id = $1 
       GROUP BY done_at::date 
       ORDER BY done_at::date DESC 
       LIMIT 7`,
      [userId]
    );
    console.log('Daily completions:', dailyCompletions.rows);
    const totalHabitsResult = await pool.query('SELECT COUNT(*) FROM habits WHERE user_id = $1', [userId]);
    console.log('Total habits:', totalHabitsResult.rows);
    const data = {
      dailyCompletions: dailyCompletions.rows,
      totalHabits: parseInt(totalHabitsResult.rows[0].count, 10),
    };
    const totalCompletionsResult = await pool.query(
      `SELECT COUNT(*) AS total_completions 
       FROM habit_completions hc 
       JOIN habits h ON hc.habit_id = h.id 
       WHERE h.user_id = $1`,
      [userId]
    );
    console.log('Total completions:', totalCompletionsResult.rows);
    const totalExpectedCompletions = data.totalHabits * 7;
    const missedCompletions = totalExpectedCompletions - totalCompletionsResult.rows[0].total_completions;
    data.missedCompletions = missedCompletions > 0 ? missedCompletions : 0;
    res.json(data);
  } catch (error) {
    console.error('Error fetching daily completion data:', error);
    res.status(500).json({ message: 'Server error fetching daily completion data.' });
  }
};

// Yearly completion data
const getYearlyCompletionData = async (req, res) => {
  const userId = req.user.id;
  console.log('Fetching yearly completion data for user ID:', userId);
  try {
    const yearlyCompletions = await pool.query(
      `SELECT EXTRACT(YEAR FROM done_at) AS year, COUNT(*) AS completions 
       FROM habit_completions hc 
       JOIN habits h ON hc.habit_id = h.id 
       WHERE h.user_id = $1 
       GROUP BY year 
       ORDER BY year DESC`,
      [userId]
    );
    console.log('Yearly completions:', yearlyCompletions.rows);
    const totalHabitsResult = await pool.query('SELECT COUNT(*) FROM habits WHERE user_id = $1', [userId]);
    console.log('Total habits:', totalHabitsResult.rows);
    const data = {
      yearlyCompletions: yearlyCompletions.rows,
      totalHabits: parseInt(totalHabitsResult.rows[0].count, 10),
    };
    const totalCompletionsResult = await pool.query(
      `SELECT COUNT(*) AS total_completions 
       FROM habit_completions hc 
       JOIN habits h ON hc.habit_id = h.id 
       WHERE h.user_id = $1`,
      [userId]
    );
    console.log('Total completions:', totalCompletionsResult.rows);
    const totalExpectedCompletions = data.totalHabits * 365;
    const missedCompletions = totalExpectedCompletions - totalCompletionsResult.rows[0].total_completions;
    data.missedCompletions = missedCompletions > 0 ? missedCompletions : 0;
    res.json(data);
  } catch (error) {
    console.error('Error fetching yearly completion data:', error);
    res.status(500).json({ message: 'Server error fetching yearly completion data.' });
  }
};

// Weekly completion data for the last 7 weeks
const getWeeklyCompletionData = async (req, res) => {
  const userId = req.user.id;
  console.log('Fetching weekly completion data for user ID:', userId);
  try {
    const weeklyCompletions = await pool.query(
      `SELECT DATE_TRUNC('week', done_at) AS week, COUNT(*) AS completions 
       FROM habit_completions hc 
       JOIN habits h ON hc.habit_id = h.id 
       WHERE h.user_id = $1 
       GROUP BY week 
       ORDER BY week DESC 
       LIMIT 7`,
      [userId]
    );
    console.log('Weekly completions:', weeklyCompletions.rows);
    const totalHabitsResult = await pool.query('SELECT COUNT(*) FROM habits WHERE user_id = $1', [userId]);
    console.log('Total habits:', totalHabitsResult.rows);
    const data = {
      weeklyCompletions: weeklyCompletions.rows,
      totalHabits: parseInt(totalHabitsResult.rows[0].count, 10),
    };
    const totalCompletionsResult = await pool.query(
      `SELECT COUNT(*) AS total_completions 
       FROM habit_completions hc 
       JOIN habits h ON hc.habit_id = h.id 
       WHERE h.user_id = $1`,
      [userId]
    );
    console.log('Total completions:', totalCompletionsResult.rows);
    const totalExpectedCompletions = data.totalHabits * 7;
    const missedCompletions = totalExpectedCompletions - totalCompletionsResult.rows[0].total_completions;
    data.missedCompletions = missedCompletions > 0 ? missedCompletions : 0;
    res.json(data);
  } catch (error) {
    console.error('Error fetching weekly completion data:', error);
    res.status(500).json({ message: 'Server error fetching weekly completion data.' });
  }
};

// Monthly completion data for the last 12 months
const getMonthlyCompletionData = async (req, res) => {
  const userId = req.user.id;
  console.log('Fetching monthly completion data for user ID:', userId);
  try {
    const monthlyCompletions = await pool.query(
      `SELECT DATE_TRUNC('month', done_at) AS month, COUNT(*) AS completions 
       FROM habit_completions hc 
       JOIN habits h ON hc.habit_id = h.id 
       WHERE h.user_id = $1 
       GROUP BY month 
       ORDER BY month DESC 
       LIMIT 12`,
      [userId]
    );
    console.log('Monthly completions:', monthlyCompletions.rows);
    const totalHabitsResult = await pool.query('SELECT COUNT(*) FROM habits WHERE user_id = $1', [userId]);
    console.log('Total habits:', totalHabitsResult.rows);
    const data = {
      monthlyCompletions: monthlyCompletions.rows,
      totalHabits: parseInt(totalHabitsResult.rows[0].count, 10),
    };
    const totalCompletionsResult = await pool.query(
      `SELECT COUNT(*) AS total_completions 
       FROM habit_completions hc 
       JOIN habits h ON hc.habit_id = h.id 
       WHERE h.user_id = $1`,
      [userId]
    );
    console.log('Total completions:', totalCompletionsResult.rows);
    const totalExpectedCompletions = data.totalHabits * 12;
    const missedCompletions = totalExpectedCompletions - totalCompletionsResult.rows[0].total_completions;
    data.missedCompletions = missedCompletions > 0 ? missedCompletions : 0;
    res.json(data);
  } catch (error) {
    console.error('Error fetching monthly completion data:', error);
    res.status(500).json({ message: 'Server error fetching monthly completion data.' });
  }
};

// Get full stats combining per-habit and overall data
const getFullStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const habitStatsResult = await pool.query(
      `SELECT 
         h.id,
         h.name,
         h.description,
         h.streak_current,
         h.streak_longest,
         h.time_perspective,
         (SELECT COUNT(*) FROM habit_completions hc WHERE hc.habit_id = h.id) AS completions,
         (EXTRACT(DAY FROM (CURRENT_DATE - h.created_at::date)) - 
          (SELECT COUNT(*) FROM habit_completions hc WHERE hc.habit_id = h.id)) AS missed
       FROM habits h
       WHERE h.user_id = $1
       ORDER BY h.id`,
      [userId]
    );
    const habitStats = habitStatsResult.rows;
    const overallResult = await pool.query(
      `SELECT 
         COUNT(*) AS total_habits,
         SUM((SELECT COUNT(*) FROM habit_completions hc WHERE hc.habit_id = h.id)) AS total_completions,
         MAX(streak_longest) AS longest_streak,
         SUM((EXTRACT(DAY FROM (CURRENT_DATE - h.created_at::date)) - (SELECT COUNT(*) FROM habit_completions hc WHERE hc.habit_id = h.id))::integer) AS total_missed
       FROM habits h
       WHERE h.user_id = $1`,
      [userId]
    );
    const overall = overallResult.rows[0];
    res.json({ habitStats, overall });
  } catch (error) {
    console.error('Error fetching full stats:', error);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
};

module.exports = {
  getHabits,
  addHabit, // default add using payload's time_perspective
  updateHabit,
  deleteHabit,
  markHabitDone,
  getStats,
  getCompletionData,
  getFullStats,
  getYearlyCompletionData,
  getWeeklyCompletionData,
  getMonthlyCompletionData,

  // New separate add endpoints by time perspective
  addDailyHabit: (req, res) => addHabitByType(req, res, 'daily'),
  addWeeklyHabit: (req, res) => addHabitByType(req, res, 'weekly'),
  addMonthlyHabit: (req, res) => addHabitByType(req, res, 'monthly'),
  addYearlyHabit: (req, res) => addHabitByType(req, res, 'yearly'),
};

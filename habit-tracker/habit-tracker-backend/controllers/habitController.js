const pool = require('../models/db');
const { checkLevelUp } = require('./userController');

// Handler to get all habits of a user
const getHabits = async (req, res) => {
  const userId = req.user.id; 
  try {
    // Query the database to get all habits for the user
    const result = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC',
      [userId]
    );
    res.json(result.rows); 
  } catch (err) {
    console.error('Error getting habits:', err);
    res.status(500).json({ message: 'Server error retrieving habits.' });
  }
};

// add a new habit
const addHabit = async (req, res) => {
  const userId = req.user.id;
  const {
    name,
    description,
    purpose,
    time_perspective,
    xp_reward,
    gold_reward,
  } = req.body;

  try {
    // Insert a new habit into the database
    const result = await pool.query(
      `INSERT INTO habits
        (user_id, name, description, purpose, streak_current, streak_longest, time_perspective, xp_reward, gold_reward)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        userId,
        name,
        description || '',
        purpose || '',
        0,
        0,
        time_perspective || 'daily', // Default to 'daily' if not provided
        xp_reward || 10,
        gold_reward || 100
      ]
    );
    res.status(201).json(result.rows[0]); 
  } catch (error) {
    console.error('Error adding habit:', error); 
    res.status(500).json({ message: 'Server error creating habit.' });
  }
};

// update an existing habit
const updateHabit = async (req, res) => {
  const userId = req.user.id; 
  const habitId = req.params.id;
  const {
    name,
    description,
    purpose,
    time_perspective,
    streak_current,
    streak_longest,
    xp_reward,
    gold_reward
  } = req.body;

  try {
    // Update the habit in the database
    const result = await pool.query(
      `UPDATE habits
       SET name = $1,
           description = $2,
           purpose = $3,
           time_perspective = $4,
           streak_current = $5,
           streak_longest = $6,
           xp_reward = $7,
           gold_reward = $8
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [
        name,
        description,
        purpose,
        time_perspective,
        streak_current,
        streak_longest,
        xp_reward,
        gold_reward,
        habitId,
        userId
      ]
    );

    // If no rows were updated, return an error
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }

    res.json(result.rows[0]); 
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Server error updating habit.' });
  }
};

// delete an existing habit
const deleteHabit = async (req, res) => {
  const userId = req.user.id; 
  const habitId = req.params.id;

  try {
    // Delete the habit from the database
    const result = await pool.query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING *',
      [habitId, userId]
    );

    // If no rows were deleted, return an error
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }

    res.json({ message: 'Habit deleted successfully', habit: result.rows[0] }); 
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Server error deleting habit.' });
  }
};

// mark a habit as done
const markHabitDone = async (req, res) => {
  const { habitId } = req.params;
  const userId = req.user.id;

  try {
    // Fetch the habit to get its xp_reward and gold_reward
    const habitResult = await pool.query(
      'SELECT xp_reward, gold_reward FROM habits WHERE id = $1 AND user_id = $2',
      [habitId, userId]
    );

    if (habitResult.rowCount === 0) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }

    const habit = habitResult.rows[0];

    // Insert the habit completion into the database
    const completionResult = await pool.query(
      'INSERT INTO habit_completions (habit_id) VALUES ($1) RETURNING *',
      [habitId]
    );

    // Update the user's XP and gold based on the habit rewards
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

// fetch statistics about habits and completions
const getStats = async (req, res) => {
  const userId = req.user.id;
  try {
    // count the total habits for the user
    const totalHabitsResult = await pool.query(
      'SELECT COUNT(*) FROM habits WHERE user_id = $1',
      [userId]
    );

    // count the total completions for the user
    const totalCompletionsResult = await pool.query(
      `SELECT COUNT(*) FROM habit_completions hc 
       JOIN habits h ON hc.habit_id = h.id 
       WHERE h.user_id = $1`,
      [userId]
    );

    // get the longest streak of habit completions
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

    // Prepare the stats object
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

// Handler to fetch completion data for the last 7 days
const getCompletionData = async (req, res) => {
  const userId = req.user.id;
  try {
    // fetch daily completions for the last 7 days
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

    // count the total habits for the user
    const totalHabitsResult = await pool.query(
      'SELECT COUNT(*) FROM habits WHERE user_id = $1',
      [userId]
    );

    const data = {
      dailyCompletions: dailyCompletions.rows,
      totalHabits: parseInt(totalHabitsResult.rows[0].count, 10),
    };

    // count the total habit completions for the user
    const totalCompletionsResult = await pool.query(
      `SELECT COUNT(*) AS total_completions 
       FROM habit_completions hc 
       JOIN habits h ON hc.habit_id = h.id 
       WHERE h.user_id = $1`,
      [userId]
    );

    // Calculate total expected completions for 7 days
    const totalExpectedCompletions = data.totalHabits * 7;
    // Calculate missed completions
    const missedCompletions = totalExpectedCompletions - totalCompletionsResult.rows[0].total_completions;

    data.missedCompletions = missedCompletions > 0 ? missedCompletions : 0;

    res.json(data); 
  } catch (error) {
    console.error('Error fetching completion data:', error); 
    res.status(500).json({ message: 'Server error fetching completion data.' });
  }
};

module.exports = {
  getHabits,
  addHabit,
  updateHabit,
  deleteHabit,
  markHabitDone,
  getStats,
  getCompletionData,
};

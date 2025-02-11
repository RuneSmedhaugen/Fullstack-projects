const pool = require('../models/db');

const getHabits = async (req, res) => {
  const userId = req.user.id;
  try {
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
        time_perspective || 'daily',
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

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Server error updating habit.' });
  }
};

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

const markHabitDone = async (req, res) => {
  const { habitId } = req.params;
  try {
    const result = await pool.query(
      `INSERT INTO habit_completions (habit_id) VALUES ($1) RETURNING *`,
      [habitId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error marking habit as done:", error);
    res.status(500).json({ message: "Error marking habit as done" });
  }
};

module.exports = {
  getHabits,
  addHabit,
  updateHabit,
  deleteHabit,
  markHabitDone,
};

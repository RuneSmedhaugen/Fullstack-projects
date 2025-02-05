const pool = require('../models/db');

exports.getHabits = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'SELECT * FROM habits WHERE user_id = $1 ORDER BY id ASC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('error getting habits:', error);
        res.status(500).json({ error: 'server error retrieving habits, fix ur code bruh'});
    }
};

exports.addHabit = async (req, res) => {
    const userId = req.user.id;
    const {
        name,
        description,
        purpose,
        time_perspective,
        xp_reward,
        gold_reward
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO habits
            (user_id, name, description, purpose, streak_current, streak_longest, time_perspective, xp_reward, gold_reward)
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9)
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
                gold_reward || 5
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('error adding habit: ', error);
        res.status(500).json({error: 'server error to create habit'});
    }
};

exports.updateHabit = async (req, res) => {
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
        return res.status(404).json({ error: 'Habit not found or not authorized' });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating habit:', error);
      res.status(500).json({ error: 'Server error updating habit' });
    }
  };
  
  
  exports.deleteHabit = async (req, res) => {
    const userId = req.user.id;
    const habitId = req.params.id;
    
    try {
      const result = await pool.query(
        'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING *',
        [habitId, userId]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Habit not found or not authorized' });
      }
  
      res.json({ message: 'Habit deleted successfully', habit: result.rows[0] });
    } catch (error) {
      console.error('Error deleting habit:', error);
      res.status(500).json({ error: 'Server error deleting habit' });
    }
  };
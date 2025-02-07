const pool = require('../models/db');


exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, username, email, xp, strength, hp, created_at FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ error: 'Server error retrieving user profile' });
  }
};



exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, xp, strength, hp } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET username = $1, email = $2, xp = $3, strength = $4, hp = $5
       WHERE id = $6 
       RETURNING id, username, email, xp, strength, hp, created_at`,
      [username, email, xp, strength, hp, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found or update failed' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Server error updating user profile' });
  }
};

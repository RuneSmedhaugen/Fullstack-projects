const pool = require('../models/db');

// Get the authenticated user's profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, username, xp, strength, hp, created_at FROM users WHERE id = $1',
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

// Update the authenticated user's profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, xp, strength, hp } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET username = $1, xp = $2, strength = $3, hp = $4
       WHERE id = $5 
       RETURNING id, username, xp, strength, hp, created_at`,
      [username, xp, strength, hp, userId]
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

const pool = require('../models/db');

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, username, email, xp, strength, hp, gold, level, created_at FROM users WHERE id = $1',
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
    let newLevel = Math.floor(xp / 100);

    const result = await pool.query(
      `UPDATE users 
       SET username = $1, email = $2, xp = $3, strength = $4, hp = $5, level = $6
       WHERE id = $7 
       RETURNING id, username, email, xp, strength, hp, gold, level, created_at`,
      [username, email, xp, strength, hp, newLevel, userId]
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


exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ error: 'Server error deleting user account' });
  }
};

const pool = require('../models/db');

exports.getUserProfile = async (req, res) => {
  try {
    console.log('getUserProfile triggered');
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, username, email, xp, strength, current_hp, max_hp, gold, level, crit_bonus, lifesteal, created_at FROM users WHERE id = $1',
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
    const { username, email, xp, strength, current_hp, max_hp } = req.body;
    let newLevel = Math.floor(xp / 100);

    const result = await pool.query(
      `UPDATE users 
       SET username = $1, email = $2, xp = $3, strength = $4, current_hp = $5, max_hp = $6, level = $7
       WHERE id = $8 
       RETURNING id, username, email, xp, strength, current_hp, max_hp, gold, level, created_at`,
      [username, email, xp, strength, current_hp, max_hp, newLevel, userId]
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

exports.checkLevelUp = async (userId) => {
  // Get the current user's xp, level, max_hp, and strength
  const result = await pool.query(
    'SELECT xp, level, max_hp, strength FROM users WHERE id = $1',
    [userId]
  );
  if (result.rows.length === 0) throw new Error('User not found');
  const user = result.rows[0];

  // Calculate the new level (each 100 XP gives one level)
  const newLevel = Math.floor(user.xp / 100);

  // If the new level is greater than the current level, update the user's stats
  if (newLevel > user.level) {
    const levelDiff = newLevel - user.level;
    const newMaxHp = user.max_hp + (10 * levelDiff);
    const newStrength = user.strength + (5 * levelDiff);

    // Update the user's level, max_hp, strength, and restore current_hp to newMaxHp
    const updateResult = await pool.query(
      'UPDATE users SET level = $1, max_hp = $2, strength = $3, current_hp = $2 WHERE id = $4 RETURNING *',
      [newLevel, newMaxHp, newStrength, userId]
    );
    return updateResult.rows[0];
  }
  return null;
};

exports.getAllUsers = async (req, res) => {
  try {
    console.log('getAllUsers triggered');
    const result = await pool.query(
      'SELECT * FROM users'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving all users:', error);
    res.status(500).json({ error: 'Server error retrieving all users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from request parameters
    console.log(`Fetching user with ID: ${id}`);

    const result = await pool.query(
      'SELECT id, username, email, xp, strength, current_hp, max_hp, gold, level, crit_bonus, lifesteal, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error retrieving user by ID:', error);
    res.status(500).json({ error: 'Server error retrieving user' });
  }
};

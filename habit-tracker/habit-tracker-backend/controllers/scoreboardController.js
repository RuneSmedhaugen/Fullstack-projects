const pool = require('../models/db');

exports.getGlobalScoreboard = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, xp, level FROM users ORDER BY xp DESC LIMIT 100'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching global scoreboard:', err);
    res.status(500).json({ error: 'Server error fetching global scoreboard' });
  }
};

exports.getFriendScoreboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendsResult = await pool.query(
      'SELECT friendid FROM friends WHERE user_id = $1',
      [userId]
    );
    
    const friendIds = friendsResult.rows.map(row => row.friendid);
    friendIds.push(userId);

    const result = await pool.query(
      'SELECT id, username, xp, level FROM users WHERE id = ANY($1) ORDER BY xp DESC',
      [friendIds]
    );
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching friend scoreboard:', err);
    res.status(500).json({ error: 'Server error fetching friend scoreboard' });
  }
};

const pool = require('../models/db');

// Add a friend
exports.addFriend = async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    const friend = await Friends.create({ userId, friendId });
    res.status(201).json(friend);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add friend' });
  }
};

// Get friend list
exports.getFriendList = async (req, res) => {
  try {
      const { userId } = req.params;
      console.log(`Fetching friend list for userId=${userId}`);

      const friends = await pool.query(
          `SELECT users.id AS friendId, users.username
           FROM friends
           JOIN users ON friends.friend_id = users.id
           WHERE friends.user_id = $1
           UNION
           SELECT users.id AS friendId, users.username
           FROM friends
           JOIN users ON friends.user_id = users.id
           WHERE friends.friend_id = $1`,
          [userId]
      );

      console.log(`Friends found: ${JSON.stringify(friends.rows)}`);

      res.status(200).json(friends.rows);
  } catch (error) {
      console.error("Error fetching friend list:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a friend
exports.deleteFriend = async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    await Friends.destroy({ where: { userId, friendId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete friend' });
  }
};

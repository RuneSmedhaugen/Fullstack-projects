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
    const friends = await Friends.findAll({ where: { userId } });
    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch friend list' });
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

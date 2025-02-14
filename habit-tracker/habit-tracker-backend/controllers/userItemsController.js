const pool = require('../models/db');

exports.getUserItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`
      SELECT ui.id AS user_item_id,
             ui.quantity,
             i.id AS item_id,
             i.name,
             i.description,
             i.effect,
             i.cost,
             i.duration,  -- Include the duration from the items table
             ui.battles_remaining,  -- Display the battles remaining
             i.created_at AS item_created_at
      FROM user_items ui
      JOIN items i ON ui.item_id = i.id
      WHERE ui.user_id = $1
      ORDER BY ui.id ASC
    `, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving user items:', error);
    res.status(500).json({ error: 'Server error retrieving user items' });
  }
};

exports.purchaseItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id, quantity } = req.body;

    // Get item cost and duration from the items table
    const itemResult = await pool.query('SELECT cost, effect, duration FROM items WHERE id = $1', [item_id]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const itemCost = itemResult.rows[0].cost;
    const duration = itemResult.rows[0].duration || 0;  // Default to 0 if no duration is specified
    const totalCost = itemCost * quantity;

    // Get user's current gold
    const userResult = await pool.query('SELECT gold FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    let userGold = userResult.rows[0].gold;

    if (userGold < totalCost) {
      return res.status(400).json({ error: 'Not enough gold to purchase this item' });
    }

    // Deduct the cost from user's gold
    userGold -= totalCost;
    await pool.query('UPDATE users SET gold = $1 WHERE id = $2', [userGold, userId]);

    // Check if user already owns the item
    const checkResult = await pool.query(
      'SELECT * FROM user_items WHERE user_id = $1 AND item_id = $2',
      [userId, item_id]
    );
    
    if (checkResult.rows.length > 0) {
      // Update the quantity and reset battles_remaining to the item's duration
      const newQuantity = checkResult.rows[0].quantity + quantity;
      const updateResult = await pool.query(
        'UPDATE user_items SET quantity = $1, battles_remaining = $2 WHERE user_id = $3 AND item_id = $4 RETURNING *',
        [newQuantity, duration, userId, item_id]
      );
      return res.json({ message: 'Item quantity updated', userItem: updateResult.rows[0], newGold: userGold });
    } else {
      // Insert a new entry for the purchased item with battles_remaining set to the duration
      const insertResult = await pool.query(
        'INSERT INTO user_items (user_id, item_id, quantity, battles_remaining) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, item_id, quantity, duration]
      );
      return res.status(201).json({ message: 'Item purchased', userItem: insertResult.rows[0], newGold: userGold });
    }
  } catch (error) {
    console.error('Error purchasing item:', error);
    res.status(500).json({ error: 'Server error purchasing item' });
  }
};

exports.useItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id } = req.body;

    // Get the item from user inventory
    const checkResult = await pool.query(
      'SELECT * FROM user_items WHERE user_id = $1 AND item_id = $2',
      [userId, item_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found in inventory' });
    }

    const userItem = checkResult.rows[0];
    const battlesRemaining = userItem.battles_remaining;

    // If battles remaining is 0, delete the item
    if (battlesRemaining <= 0) {
      await pool.query(
        'DELETE FROM user_items WHERE user_id = $1 AND item_id = $2',
        [userId, item_id]
      );
      return res.json({ message: 'Item expired and removed from inventory' });
    }

    // Otherwise, reduce the battles remaining
    await pool.query(
      'UPDATE user_items SET battles_remaining = battles_remaining - 1 WHERE user_id = $1 AND item_id = $2',
      [userId, item_id]
    );

    return res.json({ message: 'Item used successfully, remaining battles: ' + (battlesRemaining - 1) });
  } catch (error) {
    console.error('Error using item:', error);
    res.status(500).json({ error: 'Server error using item' });
  }
};

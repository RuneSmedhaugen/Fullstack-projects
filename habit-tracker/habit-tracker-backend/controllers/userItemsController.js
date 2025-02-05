const pool = require('../models/db');

// Get all items owned by the authenticated user (with item details)
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

// Purchase an item (add or update the user_items record)
exports.purchaseItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id, quantity } = req.body;
    // Check if the user already has this item
    const checkResult = await pool.query(
      'SELECT * FROM user_items WHERE user_id = $1 AND item_id = $2',
      [userId, item_id]
    );
    if (checkResult.rows.length > 0) {
      // Increase quantity if the record exists
      const newQuantity = checkResult.rows[0].quantity + quantity;
      const updateResult = await pool.query(
        'UPDATE user_items SET quantity = $1 WHERE user_id = $2 AND item_id = $3 RETURNING *',
        [newQuantity, userId, item_id]
      );
      return res.json({ message: 'Item quantity updated', userItem: updateResult.rows[0] });
    } else {
      // Insert a new record if the user doesn't already have the item
      const insertResult = await pool.query(
        'INSERT INTO user_items (user_id, item_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [userId, item_id, quantity]
      );
      return res.status(201).json({ message: 'Item purchased', userItem: insertResult.rows[0] });
    }
  } catch (error) {
    console.error('Error purchasing item:', error);
    res.status(500).json({ error: 'Server error purchasing item' });
  }
};

// Use an item (decrease quantity or remove from inventory)
exports.useItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id } = req.body; // Assuming one unit is used per call
    const checkResult = await pool.query(
      'SELECT * FROM user_items WHERE user_id = $1 AND item_id = $2',
      [userId, item_id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found in inventory' });
    }
    const userItem = checkResult.rows[0];
    if (userItem.quantity <= 1) {
      // Remove the record if only one unit is available
      await pool.query(
        'DELETE FROM user_items WHERE user_id = $1 AND item_id = $2',
        [userId, item_id]
      );
      return res.json({ message: 'Item used and removed from inventory' });
    } else {
      // Otherwise, decrement the quantity
      const newQuantity = userItem.quantity - 1;
      const updateResult = await pool.query(
        'UPDATE user_items SET quantity = $1 WHERE user_id = $2 AND item_id = $3 RETURNING *',
        [newQuantity, userId, item_id]
      );
      return res.json({ message: 'Item used', userItem: updateResult.rows[0] });
    }
  } catch (error) {
    console.error('Error using item:', error);
    res.status(500).json({ error: 'Server error using item' });
  }
};

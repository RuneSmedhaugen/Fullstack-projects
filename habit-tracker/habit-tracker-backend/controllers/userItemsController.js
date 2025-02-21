const pool = require('../models/db');
const {
  applyHealthEffect,
  applyEggEffect,
  applyCritEffect,
  applyForkEffect,
  applyWalletEffect,
  applyTeapotEffect,
  applyKeyEffect,
} = require('./itemEffects');

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

    const itemResult = await pool.query('SELECT cost, effect, duration FROM items WHERE id = $1', [item_id]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const itemCost = itemResult.rows[0].cost;
    const duration = itemResult.rows[0].duration || 0;
    const totalCost = itemCost * quantity;

    const userResult = await pool.query('SELECT gold FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    let userGold = userResult.rows[0].gold;

    if (userGold < totalCost) {
      return res.status(400).json({ error: 'Not enough gold to purchase this item' });
    }

    userGold -= totalCost;
    await pool.query('UPDATE users SET gold = $1 WHERE id = $2', [userGold, userId]);

    const checkResult = await pool.query(
      'SELECT * FROM user_items WHERE user_id = $1 AND item_id = $2',
      [userId, item_id]
    );

    if (checkResult.rows.length > 0) {
      const newQuantity = checkResult.rows[0].quantity + quantity;
      const updateResult = await pool.query(
        'UPDATE user_items SET quantity = $1, battles_remaining = $2 WHERE user_id = $3 AND item_id = $4 RETURNING *',
        [newQuantity, duration, userId, item_id]
      );
      return res.json({ message: 'Item quantity updated', userItem: updateResult.rows[0], newGold: userGold });
    } else {
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

    // Fetch user item details, including effect and base duration from the items table.
    const checkResult = await pool.query(
      `SELECT ui.*, i.effect, i.duration AS base_duration
       FROM user_items ui
       JOIN items i ON ui.item_id = i.id
       WHERE ui.user_id = $1 AND ui.item_id = $2`,
      [userId, item_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found in inventory' });
    }

    const userItem = checkResult.rows[0];
    const baseDuration = userItem.base_duration;
    let newBattlesRemaining = userItem.battles_remaining - 1;
    let message = '';

    // Apply the effect based on the item's effect string.
    const effect = userItem.effect;
    if (effect.startsWith('health_')) {
      const healAmount = parseInt(effect.split('_')[1], 10);
      message = await applyHealthEffect(userId, healAmount);
    } else if (effect.startsWith('egg_')) {
      message = await applyEggEffect(userId, effect);
    } else if (effect.startsWith('toiletpaper_')) {
      message = await applyCritEffect(userId, effect);
    } else if (effect.startsWith('fork_')) {
      message = await applyForkEffect(userId, effect);
    } else if (effect.startsWith('wallet_')) {
      message = await applyWalletEffect(userId, effect);
    } else if (effect.startsWith('teapot_')) {
      message = await applyTeapotEffect(userId, effect);
    } else if (effect.startsWith('key_')) {
      message = await applyKeyEffect(userId, effect);
    } else {
      return res.status(400).json({ error: 'Unknown item effect' });
    }

    // Handle the item usage based on remaining uses and quantity.
    if (newBattlesRemaining > 0) {
      await pool.query(
        'UPDATE user_items SET battles_remaining = $1 WHERE user_id = $2 AND item_id = $3',
        [newBattlesRemaining, userId, item_id]
      );
    } else {
      // This item instance is used up.
      if (userItem.quantity > 1) {
        // Reduce the stack by 1 and reset the battles_remaining to the base duration for the next item.
        await pool.query(
          'UPDATE user_items SET quantity = quantity - 1, battles_remaining = $1 WHERE user_id = $2 AND item_id = $3',
          [baseDuration, userId, item_id]
        );
      } else {
        // Only one item left, so remove the row.
        await pool.query(
          'DELETE FROM user_items WHERE user_id = $1 AND item_id = $2',
          [userId, item_id]
        );
      }
    }

    return res.json({ message });
  } catch (error) {
    console.error('Error using item:', error);
    res.status(500).json({ error: 'Server error using item' });
  }
};


exports.activateItem = async (req, res) => {
  try {
    const { item_id } = req.body;
    const userId = req.user.id;

    const itemQuery = await pool.query('SELECT * FROM items WHERE id = $1', [item_id]);
    const item = itemQuery.rows[0];

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    const effect = item.effect;
    let bonus = 0;

    if (effect === 'toiletpaper_gold') {
      bonus = 15;
    } else if (effect === 'toiletpaper_silver') {
      bonus = 10;
    } else if (effect === 'toiletpaper_bronze') {
      bonus = 5;
    } else if (effect.startsWith('crit_')) {
      bonus = parseInt(effect.split('_')[1], 10);
    } else {
      return res.status(400).json({ message: 'Unknown item effect.' });
    }

    await pool.query(
      'UPDATE users SET crit_bonus = crit_bonus + $1 WHERE id = $2',
      [bonus, userId]
    );

    await pool.query(
      'UPDATE user_items SET quantity = quantity - 1 WHERE user_id = $1 AND item_id = $2',
      [userId, item_id]
    );

    res.json({ message: `Crit bonus increased by ${bonus}%!` });
  } catch (error) {
    console.error('Error activating item:', error);
    res.status(500).json({ message: 'Error activating item.' });
  }
};

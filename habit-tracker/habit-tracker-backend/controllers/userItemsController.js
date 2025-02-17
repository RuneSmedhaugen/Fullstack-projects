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

    // Fetch the item and its effect
    const checkResult = await pool.query(
      'SELECT * FROM user_items WHERE user_id = $1 AND item_id = $2',
      [userId, item_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found in inventory' });
    }

    const userItem = checkResult.rows[0];
    const { battles_remaining } = userItem;

    // If no battles left, remove the item
    if (battles_remaining <= 0) {
      await pool.query(
        'DELETE FROM user_items WHERE user_id = $1 AND item_id = $2',
        [userId, item_id]
      );
      return res.json({ message: 'Item expired and removed from inventory' });
    }

    // Decode the effect string (e.g., 'crit_3_battles')
    const effect = userItem.effect;
    let statEffect = null;
    if (effect.startsWith('crit_')) {
      const critBattles = parseInt(effect.split('_')[1], 10);
      statEffect = { type: 'crit', value: critBattles };
    } else if (effect.startsWith('health_')) {
      const hpBattles = parseInt(effect.split('_')[1], 10);
      statEffect = { type: 'health', value: hpBattles };
    } else if (effect.startsWith('damage_')) {
      const damageBattles = parseInt(effect.split('_')[1], 10);
      statEffect = { type: 'damage', value: damageBattles };
    }

    // Apply the effect to the user's stats (this example assumes a simple crit multiplier)
    if (statEffect) {
      // Example: Apply stat changes based on the type of effect
      if (statEffect.type === 'crit') {
        // Increase the user's crit chance, or apply a multiplier
        await pool.query(
          'UPDATE users SET crit_bonus = crit_bonus + $1 WHERE id = $2',
          [statEffect.value, userId]
        );
      } else if (statEffect.type === 'health') {
        // Increase the user's HP
        await pool.query(
          'UPDATE users SET hp = hp + $1 WHERE id = $2',
          [statEffect.value, userId]
        );
      } else if (statEffect.type === 'damage') {
        // Increase the user's damage
        await pool.query(
          'UPDATE users SET damage = damage + $1 WHERE id = $2',
          [statEffect.value, userId]
        );
      }

      // Update the remaining battles for the item
      await pool.query(
        'UPDATE user_items SET battles_remaining = battles_remaining - 1 WHERE user_id = $1 AND item_id = $2',
        [userId, item_id]
      );

      return res.json({
        message: `Item used successfully. Remaining battles: ${battles_remaining - 1}`,
      });
    }

  } catch (error) {
    console.error('Error using item:', error);
    res.status(500).json({ error: 'Server error using item' });
  }
};

exports.activateItem = async (req, res) => {
  try {
      const { item_id } = req.body;
      const userId = req.user.id;

      // Fetch the item details
      const itemQuery = await pool.query('SELECT * FROM items WHERE id = $1', [item_id]);
      const item = itemQuery.rows[0];

      if (!item) {
          return res.status(404).json({ message: 'Item not found.' });
      }

      // Apply the item effect
      const effect = item.effect; // Assuming the effect is stored in the `effect` column of the items table

      // Example of activating the effect (crit, health, damage, etc.)
      if (effect.startsWith('crit_')) {
          const critBattles = parseInt(effect.split('_')[1], 10);
          await pool.query('UPDATE users SET crit_bonus = crit_bonus + $1 WHERE id = $2', [critBattles, userId]);
      } else if (effect.startsWith('hp_')) {
          const hpIncrease = parseInt(effect.split('_')[1], 10);
          await pool.query('UPDATE users SET hp = hp + $1 WHERE id = $2', [hpIncrease, userId]);
      } else if (effect.startsWith('damage_')) {
          const damageIncrease = parseInt(effect.split('_')[1], 10);
          await pool.query('UPDATE users SET damage = damage + $1 WHERE id = $2', [damageIncrease, userId]);
      }

      // Optionally, mark the item as used
      await pool.query('UPDATE user_items SET quantity = quantity - 1 WHERE user_id = $1 AND item_id = $2', [userId, item_id]);

      res.json({ message: 'Item effect activated successfully!' });
  } catch (error) {
      console.error('Error activating item:', error);
      res.status(500).json({ message: 'Error activating item.' });
  }
};
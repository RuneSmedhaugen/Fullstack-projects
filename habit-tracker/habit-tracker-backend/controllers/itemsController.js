const pool = require('../models/db');

// Get all available items
exports.getItems = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving items:', error);
    res.status(500).json({ error: 'Server error retrieving items' });
  }
};

// (Optional) Get a single item by ID
exports.getItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const result = await pool.query('SELECT * FROM items WHERE id = $1', [itemId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error retrieving item:', error);
    res.status(500).json({ error: 'Server error retrieving item' });
  }
};

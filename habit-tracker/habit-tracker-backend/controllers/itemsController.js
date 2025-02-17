// Importing the database pool for making queries to the database
const pool = require('../models/db');

// Handler for getting all items from the database
exports.getItems = async (req, res) => {
  try {
    // Querying all items and ordering them by their 'id' in ascending order
    const result = await pool.query('SELECT * FROM items ORDER BY id ASC');
    // Sending the retrieved rows as JSON response
    res.json(result.rows);
  } catch (error) {
    // Logging error if an issue occurs while retrieving items
    console.error('Error retrieving items:', error);
    // Sending a 500 status code and an error message as JSON response
    res.status(500).json({ error: 'Server error retrieving items' });
  }
};

// Handler for getting a specific item by its 'id'
exports.getItem = async (req, res) => {
  try {
    // Extracting the item 'id' from the request parameters
    const itemId = req.params.id;
    // Querying a single item by its 'id'
    const result = await pool.query('SELECT * FROM items WHERE id = $1', [itemId]);

    // Checking if the item does not exist
    if (result.rows.length === 0) {
      // If item is not found, sending a 404 response with an error message
      return res.status(404).json({ error: 'Item not found' });
    }

    // If the item is found, sending the item data as JSON response
    res.json(result.rows[0]);
  } catch (error) {
    // Logging error if an issue occurs while retrieving the item
    console.error('Error retrieving item:', error);
    // Sending a 500 status code and an error message as JSON response
    res.status(500).json({ error: 'Server error retrieving item' });
  }
};

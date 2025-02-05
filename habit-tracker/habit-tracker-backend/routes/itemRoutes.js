const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getItems, getItem } = require('../controllers/itemsController');

router.get('/', authMiddleware, getItems);
router.get('/:id', authMiddleware, getItem);

module.exports = router;

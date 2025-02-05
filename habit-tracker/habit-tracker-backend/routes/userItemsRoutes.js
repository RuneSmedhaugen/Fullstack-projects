const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserItems, purchaseItem, useItem } = require('../controllers/userItemsController');

router.get('/', authMiddleware, getUserItems);
router.post('/purchase', authMiddleware, purchaseItem);
router.post('/use', authMiddleware, useItem);

module.exports = router;

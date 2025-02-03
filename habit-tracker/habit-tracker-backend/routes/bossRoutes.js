const express = require('express');
const router = express.Router();
const { getBoss, attackBoss } = require('../controllers/bossController');
const authMiddleware = require ('../middleware/authMiddleware');

router.get('/', authMiddleware, getBoss);

router.post('/attack', authMiddleware, attackBoss);

module.exports = router; 
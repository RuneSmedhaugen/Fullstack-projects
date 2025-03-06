const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {  getBoss, userAttackBoss, bossAttackUser, } = require('../controllers/bossController');

// Get current boss
router.get('/', authMiddleware, getBoss);

// Attack boss
/*router.post('/attack', authMiddleware, attackBoss);*/

router.post('/userattack', authMiddleware, userAttackBoss);
router.post('/bossattack', authMiddleware, bossAttackUser);


module.exports = router;

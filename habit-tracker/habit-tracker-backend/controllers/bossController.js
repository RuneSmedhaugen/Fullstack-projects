const pool = require('../models/db');

const createNewBoss = async (userId, level) => {
    try {
        const basehp = 100;
        const basestrength = 10;
        const hp = basehp + (level - 1) * 10;
        const strength = basestrength + (level - 1) * 10;
        const xpReward = 50 + (level - 1);
        const goldReward = 10 + (level - 1);

        const result = await pool.query(
            `INSERT INTO Bosses (user_id, level, hp, strength, xp_reward, gold_reward)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [userId, level, hp, strength, xpReward, goldReward]
        );
        return result.rows[0];
    } catch (err) {
        console.error('Error creating new boss:', err);
        throw err;
    }
};


exports.getBoss = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT * FROM bosses WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
            [userId]
        );

        if (result.rows.length == 0) {
            const newBoss = await createNewBoss(userId, 1);
            return res.json(newBoss);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.attackBoss = async (req, res) => {
    try {
        const userId = req.user.id;
        const { damage } = req.body;

        if (!damage) {
            return res.status(400).json({ error: 'damage value is required' });
        }

        const bossResult = await pool.query(
            `SELECT * FROM bosses WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
            [userId]
        );
        let boss = bossResult.rows[0];

        if (!boss) {
            boss = await createNewBoss(userId, 1);
        }

        let newHp = boss.hp - damage;

        if (newHp <= 0) {
            await pool.query(`
                UPDATE users SET xp = xp +$1, gold = gold + $2 WHERE id = $3`,
                [boss.xp_reward, boss.gold_reward, userId]
            );
            const newBoss = await createNewBoss(userId, boss.level + 1);
            return res.json({ message: 'boss defeated', newBoss });
        } else {
            const updatedBossResult = await pool.query(
                'UPDATE bosses SET hp = $1 WHERE id = $2 RETURNING *',
                [newHp, boss.id]
            );
            res.json({ message: 'yes you attack but failed to kill it doofus', boss: updatedBossResult.rows[0] });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server doomed kekw' });
    }
};
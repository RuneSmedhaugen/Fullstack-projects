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
        `INSERT INTO bosses (user_id, level, hp, strength, xp_reward, gold_reward)
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
      // (We no longer need a damage value from the request body.)
      
      // Fetch current boss and user stats
      const bossResult = await pool.query(
        `SELECT * FROM bosses WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
        [userId]
      );
      const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
      
      let boss = bossResult.rows[0];
      let user = userResult.rows[0];
      let turnLog = [];
      
      if (!boss) {
        boss = await createNewBoss(userId, 1);
      }
      
      // User's turn: user attacks boss
      const playerDamage = user.strength;
      boss.hp -= playerDamage;
      turnLog.push(`User attacked boss for ${playerDamage} damage. Boss HP: ${Math.max(boss.hp, 0)}`);
      
      if (boss.hp <= 0) {
        // Boss defeated: award rewards and create a new boss
        await pool.query(
          `UPDATE users SET xp = xp + $1, gold = gold + $2 WHERE id = $3`,
          [boss.xp_reward, boss.gold_reward, userId]
        );
        const newBoss = await createNewBoss(userId, boss.level + 1);
        return res.json({ message: 'Boss defeated!', log: turnLog, newBoss });
      }
      
      // Boss's turn: boss attacks user
      const bossDamage = boss.strength;
      user.hp -= bossDamage;
      turnLog.push(`Boss attacked user for ${bossDamage} damage. User HP: ${Math.max(user.hp, 0)}`);
      
      if (user.hp <= 0) {
        // User defeated: reset user's HP to max_hp (assumed stored in user.max_hp)
        await pool.query(`UPDATE users SET hp = $1 WHERE id = $2`, [user.max_hp, userId]);
        return res.json({ message: 'User defeated! Try again.', log: turnLog, boss, user });
      }
      
      // Update DB with the new HP values
      await pool.query(`UPDATE bosses SET hp = $1 WHERE id = $2`, [boss.hp, boss.id]);
      await pool.query(`UPDATE users SET hp = $1 WHERE id = $2`, [user.hp, userId]);
      
      return res.json({ message: 'Turn complete', log: turnLog, boss, user });
    } catch (err) {
      console.error('Error during boss attack:', err);
      res.status(500).json({ error: 'Server error during boss attack' });
    }
  };
  
  
  
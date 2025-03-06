const pool = require('../models/db');
const { checkLevelUp } = require('./userController');
const { getLifestealPercentage, clearLifestealEffect } = require('./itemEffects');

// Create a new boss for the user, based on the level
const createNewBoss = async (userId, level) => {
    try {
      const basehp = 100;
      const basestrength = 10;
  
      // Calculate boss stats
      const hp = basehp + (level - 1) * 10;
      const strength = basestrength + (level - 1) * 10;
      const xpReward = 50 + (level - 1);
      const goldReward = 10 + (level - 1);
  
      // Insert new boss into the database
      const result = await pool.query(
        `INSERT INTO bosses (user_id, level, current_hp, max_hp, strength, xp_reward, gold_reward)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [userId, level, hp, hp, strength, xpReward, goldReward]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error creating new boss:', err);
      throw err;
    }
  };
  

// Get the most recent boss for the user or create one if none exists
exports.getBoss = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM bosses WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
      [userId]
    );
    if (result.rows.length === 0) {
      const newBoss = await createNewBoss(userId, 1);
      return res.json(newBoss);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// boss attack and update boss and user stats
/* exports.attackBoss = async (req, res) => {
    try {
        const userId = req.user.id;

        const bossResult = await pool.query(
            `SELECT * FROM bosses WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
            [userId]
        );
        const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
        let boss = bossResult.rows[0];
        let user = userResult.rows[0];
        let turnLog = [];

        if (!boss) {
            boss = await createNewBoss(userId, 1);  // Create new boss if not found
        }

        const lifestealPercentage = await getLifestealPercentage(userId);
        
        // User attacks boss
        const baseDamage = user.strength;
        const critChance = user.crit_bonus || 0;
        const randomValue = Math.random() * 100;
        let actualDamage = baseDamage;
        if (randomValue < critChance) {
            actualDamage = baseDamage * 2;
            turnLog.push(`Critical hit! Damage doubled to ${actualDamage}.`);
        }
        
        boss.current_hp -= actualDamage;
        turnLog.push(`You attacked boss for ${actualDamage} damage. Boss HP: ${Math.max(boss.current_hp, 0)}`);

        // Apply lifesteal effect using actualDamage
        if (lifestealPercentage > 0) {
            const healthRegained = Math.floor(actualDamage * (lifestealPercentage / 100));
            user.current_hp = Math.min(user.current_hp + healthRegained, user.max_hp);
            turnLog.push(`Lifesteal restored ${healthRegained} HP. User HP: ${user.current_hp}`);
        }

        // If boss is defeated, check level up, and create a new boss
        if (boss.current_hp <= 0) {
            await pool.query(
                `UPDATE users SET xp = xp + $1, gold = gold + $2 WHERE id = $3`,
                [boss.xp_reward, boss.gold_reward, userId]
            );

            await pool.query('UPDATE users SET crit_bonus = 0 WHERE id = $1', [userId]);
            
            await clearLifestealEffect(userId);

            // Check for level up after awarding XP
            const levelUpData = await checkLevelUp(userId);
            
            // Create a new boss with the next level
            const newBoss = await createNewBoss(userId, boss.level + 1);
            return res.json({ 
                message: 'Boss defeated!', 
                log: turnLog, 
                newBoss, 
                levelUpData 
            });
        }

        // Boss attacks user
        const bossDamage = boss.strength;
        user.current_hp -= bossDamage;
        turnLog.push(`Boss attacked you for ${bossDamage} damage. Your HP: ${Math.max(user.current_hp, 0)}`);

        // If user is defeated, reset current_hp to max_hp
        if (user.current_hp <= 0) {
            await pool.query('UPDATE users SET crit_bonus = 0 WHERE id = $1', [userId]);
            await pool.query(`UPDATE users SET current_hp = max_hp WHERE id = $1`, [userId]);
            return res.json({ message: 'You are defeated! Try again.', log: turnLog, boss, user });
        }

        // Update boss and user HP in the database
        await pool.query(`UPDATE bosses SET current_hp = $1 WHERE id = $2`, [boss.current_hp, boss.id]);
        await pool.query(`UPDATE users SET current_hp = $1 WHERE id = $2`, [user.current_hp, userId]);

        return res.json({ message: 'Turn complete', log: turnLog, boss, user });
    } catch (err) {
        console.error('Error during boss attack:', err);
        res.status(500).json({ error: 'Server error during boss attack' });
    }
};
*/

exports.userAttackBoss = async (req, res) => {
    try {
        const userId = req.user.id;
        const bossResult = await pool.query(
            `SELECT * FROM bosses WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
            [userId]
        );
        const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
        let boss = bossResult.rows[0];
        let user = userResult.rows[0];
        let turnLog = [];

        if (!boss) {
            boss = await createNewBoss(userId, 1);  // Create new boss if not found
        }

        const lifestealPercentage = await getLifestealPercentage(userId);

        // User attacks boss
        const baseDamage = user.strength;
        const critChance = user.crit_bonus || 0;
        const randomValue = Math.random() * 100;
        let actualDamage = baseDamage;
        if (randomValue < critChance) {
            actualDamage = baseDamage * 2;
            turnLog.push(`Critical hit! Damage doubled to ${actualDamage}.`);
        }

        boss.current_hp -= actualDamage;
        turnLog.push(`You attacked boss for ${actualDamage} damage. Boss HP: ${Math.max(boss.current_hp, 0)}`);

        // Apply lifesteal effect using actualDamage
        if (lifestealPercentage > 0) {
            const healthRegained = Math.floor(actualDamage * (lifestealPercentage / 100));
            user.current_hp = Math.min(user.current_hp + healthRegained, user.max_hp);
            turnLog.push(`Lifesteal restored ${healthRegained} HP. User HP: ${user.current_hp}`);
        }

        // If boss is defeated, handle XP, level up, and new boss creation
        if (boss.current_hp <= 0) {
            await pool.query(
                `UPDATE users SET xp = xp + $1, gold = gold + $2 WHERE id = $3`,
                [boss.xp_reward, boss.gold_reward, userId]
            );
            await pool.query('UPDATE users SET crit_bonus = 0 WHERE id = $1', [userId]);
            await clearLifestealEffect(userId);

            const levelUpData = await checkLevelUp(userId);
            const newBoss = await createNewBoss(userId, boss.level + 1);

            return res.json({
                message: 'Boss defeated!',
                log: turnLog,
                newBoss,
                levelUpData
            });
        }

        // Update boss HP in the database
        await pool.query(`UPDATE bosses SET current_hp = $1 WHERE id = $2`, [boss.current_hp, boss.id]);
        await pool.query(`UPDATE users SET current_hp = $1 WHERE id = $2`, [user.current_hp, userId]);

        return res.json({ message: 'User attack complete', log: turnLog, boss, user });
    } catch (err) {
        console.error('Error during user attack on boss:', err);
        res.status(500).json({ error: 'Server error during user attack on boss' });
    }
};

exports.bossAttackUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const bossResult = await pool.query(
            `SELECT * FROM bosses WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
            [userId]
        );
        const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
        const boss = bossResult.rows[0];
        let user = userResult.rows[0];
        let turnLog = [];

        if (!boss) {
            return res.status(404).json({ error: 'No boss found for this user.' });
        }

        // Boss attacks user
        const bossDamage = boss.strength;
        user.current_hp -= bossDamage;
        turnLog.push(`Boss attacked you for ${bossDamage} damage. Your HP: ${Math.max(user.current_hp, 0)}`);

        // If user is defeated
        if (user.current_hp <= 0) {
            await pool.query('UPDATE users SET crit_bonus = 0 WHERE id = $1', [userId]);
            await pool.query(`UPDATE users SET current_hp = max_hp WHERE id = $1`, [userId]);
            return res.json({ message: 'You are defeated! Try again.', log: turnLog, boss, user });
        }

        // Update user HP in the database
        await pool.query(`UPDATE users SET current_hp = $1 WHERE id = $2`, [user.current_hp, userId]);

        return res.json({ message: 'Boss attack complete', log: turnLog, boss, user });
    } catch (err) {
        console.error('Error during boss attack on user:', err);
        res.status(500).json({ error: 'Server error during boss attack on user' });
    }
};

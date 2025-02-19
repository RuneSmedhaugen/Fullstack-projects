const pool = require('../models/db');

// Health Potion Effect: Increase current HP up to max HP.
async function applyHealthEffect(userId, healAmount) {
    const userQuery = await pool.query('SELECT current_hp, max_hp FROM users WHERE id = $1', [userId]);
    const user = userQuery.rows[0];
    const newHP = Math.min(user.current_hp + healAmount, user.max_hp);
    await pool.query('UPDATE users SET current_hp = $1 WHERE id = $2', [newHP, userId]);
    return `Healed ${healAmount} HP!`;
}

// Egg Effect: Increase max HP (persist until battle reset).
async function applyEggEffect(userId, effect) {
    let addMaxHp;
    if (effect === 'egg_gold') {
        addMaxHp = 50;
    } else if (effect === 'egg_silver') {
        addMaxHp = 30;
    } else if (effect === 'egg_bronze') {
        addMaxHp = 15;
    } else {
        throw new Error('Unknown egg effect');
    }
    await pool.query('UPDATE users SET max_hp = max_hp + $1, current_hp = current_hp + $1 WHERE id = $2', [addMaxHp, userId]);
    return `Your max HP increased by ${addMaxHp} until the next battle reset!`;
}

// Crit Effect: Increase user's crit bonus.
async function applyCritEffect(userId, critValue) {
    await pool.query('UPDATE users SET crit_bonus = crit_bonus + $1 WHERE id = $2', [critValue, userId]);
    return `Crit chance increased by ${critValue}!`;
}

async function applyForkEffect(userId, effect) {
    let damage;
    if (effect === 'fork_gold') {
        damage = 100;
    } else if (effect === 'fork_silver') {
        damage = 75;
    } else if (effect === 'fork_bronze') {
        damage = 50;
    } else {
        throw new Error('Unknown fork effect');
    }

    // Get the latest boss for the user
    const bossQuery = await pool.query(
        'SELECT * FROM bosses WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
        [userId]
    );
    if (bossQuery.rows.length === 0) {
        throw new Error('Boss not found for user');
    }
    const boss = bossQuery.rows[0];

    // Calculate new boss HP (ensure it doesn't go below zero)
    const newBossHP = Math.max(boss.current_hp - damage, 0);
    await pool.query(
        'UPDATE bosses SET current_hp = $1 WHERE id = $2',
        [newBossHP, boss.id]
    );

    return `Fork used! Boss takes ${damage} damage. Boss HP is now ${newBossHP}/${boss.max_hp}.`;
}

async function applyWalletEffect(userId, effect) {
    let debuff;
    if (effect === 'wallet_gold') {
        debuff = 15; // Gold wallet reduces boss strength by 15
    } else if (effect === 'wallet_silver') {
        debuff = 10; // Silver wallet reduces boss strength by 10
    } else if (effect === 'wallet_bronze') {
        debuff = 5;  // Bronze wallet reduces boss strength by 5
    } else {
        throw new Error('Unknown wallet effect');
    }

    // Retrieve the current boss for the user
    const bossQuery = await pool.query(
        'SELECT * FROM bosses WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
        [userId]
    );
    if (bossQuery.rows.length === 0) {
        throw new Error('Boss not found for user');
    }
    const boss = bossQuery.rows[0];
    // Calculate new strength ensuring it doesn't drop below 0
    const newStrength = Math.max(boss.strength - debuff, 0);
    await pool.query('UPDATE bosses SET strength = $1 WHERE id = $2', [newStrength, boss.id]);
    return `Wallet used! Boss strength decreased by ${debuff}. New strength: ${newStrength}.`;
}

module.exports = {
    applyWalletEffect,
    applyHealthEffect,
    applyEggEffect,
    applyCritEffect,
    applyForkEffect,
};

const cron = require('node-cron');
const pool = require('../models/db');

cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Resetting habit completions at midnight CET');
    await pool.query('DELETE FROM habit_completions WHERE done_at::date = CURRENT_DATE');
    console.log('Habit completions reset successfully');
  } catch (error) {
    console.error('Error resetting habit completions:', error);
  }
});
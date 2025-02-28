'use strict';

const { Pool } = require('pg');
const pool = new Pool({
  user: 'your_username',      // replace with your DB username
  host: 'localhost',           // replace with your DB host
  database: 'your_database',   // replace with your DB name
  password: 'your_password',   // replace with your DB password
  port: 5432,                  // default PostgreSQL port
});

// Export the pool for use in other files
module.exports = pool;

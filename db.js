// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'centralmech',
  host: process.env.DB_HOST || 'timesheetdb.cz4s4ye26uw4.us-east-2.rds.amazonaws.com',
  database: process.env.DB_NAME || 'timesheetdb',
  password: process.env.DB_PASSWORD || 'Faithful2025!',
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;

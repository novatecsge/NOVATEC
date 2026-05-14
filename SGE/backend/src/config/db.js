const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password
});

pool.on('error', (error) => {
  console.error('Error inesperado en PostgreSQL:', error);
});

const query = (text, params = []) => pool.query(text, params);
const getClient = () => pool.connect();

module.exports = {
  pool,
  query,
  getClient
};
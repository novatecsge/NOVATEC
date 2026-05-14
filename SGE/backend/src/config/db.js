const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction
        ? {
            rejectUnauthorized: false
          }
        : false
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'parking',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              rejectUnauthorized: false
            }
          : false
    });

const query = (text, params) => pool.query(text, params);

const testConnection = async () => {
  await pool.query('SELECT NOW()');
  console.log('PostgreSQL conectado correctamente');
};

module.exports = {
  pool,
  query,
  testConnection
};
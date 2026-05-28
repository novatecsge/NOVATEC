const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

const run = async () => {
  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('Esquema aplicado correctamente en la base de datos.');
  } catch (error) {
    console.error('No se pudo aplicar el esquema:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();

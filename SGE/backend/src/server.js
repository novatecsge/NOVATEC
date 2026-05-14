const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const { setIo } = require('./config/socket');
const { pool } = require('./config/db');

const server = http.createServer(app);

const { runMaintenanceJobs } = require('./jobs/maintenance.jobs');

const socketAllowedOrigins = [
  env.frontendUrl,
  process.env.RENDER_EXTERNAL_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (socketAllowedOrigins.length === 0 || socketAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (env.nodeEnv !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origen de socket no permitido'));
    },
    credentials: true
  }
});

const { verifyAccessToken } = require('./shared/utils/jwt');

io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Socket no autenticado'));
    }

    const decoded = verifyAccessToken(token);
    socket.auth = decoded;
    next();
  } catch (error) {
    next(new Error('Token de socket inválido'));
  }
});

io.on('connection', (socket) => {
  const role = socket.auth?.role;
  const userId = socket.auth?.userId;

  if (role === 'ADMIN') {
    socket.join('admin');
  }

  if (role === 'GUARD') {
    socket.join('guards');
  }

  if (userId) {
    socket.join(`users:${userId}`);
  }

  socket.on('disconnect', () => {
    // conexión cerrada
  });
});

setIo(io);


const ensureParkingLayout = async () => {
  const spaces = [{"code": "A1", "number": 1, "type": "AUTO"}, {"code": "A2", "number": 2, "type": "AUTO"}, {"code": "A3", "number": 3, "type": "AUTO"}, {"code": "A4", "number": 4, "type": "AUTO"}, {"code": "A5", "number": 5, "type": "AUTO"}, {"code": "A6", "number": 6, "type": "AUTO"}, {"code": "A7", "number": 7, "type": "AUTO"}, {"code": "A8", "number": 8, "type": "AUTO"}, {"code": "A9", "number": 9, "type": "AUTO"}, {"code": "A10", "number": 10, "type": "AUTO"}, {"code": "A11", "number": 11, "type": "AUTO"}, {"code": "A12", "number": 12, "type": "AUTO"}, {"code": "B1", "number": 13, "type": "AUTO"}, {"code": "B2", "number": 14, "type": "AUTO"}, {"code": "B3", "number": 15, "type": "AUTO"}, {"code": "B4", "number": 16, "type": "AUTO"}, {"code": "B5", "number": 17, "type": "AUTO"}, {"code": "B6", "number": 18, "type": "AUTO"}, {"code": "B7", "number": 19, "type": "AUTO"}, {"code": "B8", "number": 20, "type": "AUTO"}, {"code": "B9", "number": 21, "type": "AUTO"}, {"code": "B10", "number": 22, "type": "AUTO"}, {"code": "B11", "number": 23, "type": "AUTO"}, {"code": "B12", "number": 24, "type": "AUTO"}, {"code": "B13", "number": 25, "type": "AUTO"}, {"code": "C1", "number": 26, "type": "AUTO"}, {"code": "C2", "number": 27, "type": "AUTO"}, {"code": "C3", "number": 28, "type": "AUTO"}, {"code": "C4", "number": 29, "type": "AUTO"}, {"code": "D1", "number": 30, "type": "AUTO"}, {"code": "D2", "number": 31, "type": "AUTO"}, {"code": "D3", "number": 32, "type": "AUTO"}, {"code": "D4", "number": 33, "type": "AUTO"}, {"code": "D5", "number": 34, "type": "AUTO"}, {"code": "D6", "number": 35, "type": "AUTO"}, {"code": "D7", "number": 36, "type": "AUTO"}, {"code": "D8", "number": 37, "type": "AUTO"}, {"code": "D9", "number": 38, "type": "AUTO"}, {"code": "D10", "number": 39, "type": "AUTO"}, {"code": "D11", "number": 40, "type": "AUTO"}, {"code": "D12", "number": 41, "type": "AUTO"}, {"code": "D13", "number": 42, "type": "AUTO"}, {"code": "D14", "number": 43, "type": "AUTO"}, {"code": "D15", "number": 44, "type": "AUTO"}, {"code": "E1", "number": 45, "type": "AUTO"}, {"code": "E2", "number": 46, "type": "AUTO"}, {"code": "E3", "number": 47, "type": "AUTO"}, {"code": "E4", "number": 48, "type": "AUTO"}, {"code": "E5", "number": 49, "type": "AUTO"}, {"code": "E6", "number": 50, "type": "AUTO"}, {"code": "E7", "number": 51, "type": "AUTO"}, {"code": "E8", "number": 52, "type": "AUTO"}, {"code": "E9", "number": 53, "type": "AUTO"}, {"code": "E10", "number": 54, "type": "AUTO"}, {"code": "E11", "number": 55, "type": "AUTO"}, {"code": "E12", "number": 56, "type": "AUTO"}, {"code": "F1", "number": 57, "type": "AUTO"}, {"code": "F2", "number": 58, "type": "AUTO"}, {"code": "F3", "number": 59, "type": "AUTO"}, {"code": "F4", "number": 60, "type": "AUTO"}, {"code": "F5", "number": 61, "type": "AUTO"}, {"code": "F6", "number": 62, "type": "AUTO"}, {"code": "F7", "number": 63, "type": "AUTO"}, {"code": "F8", "number": 64, "type": "AUTO"}, {"code": "F9", "number": 65, "type": "AUTO"}, {"code": "F10", "number": 66, "type": "AUTO"}, {"code": "F11", "number": 67, "type": "AUTO"}, {"code": "F12", "number": 68, "type": "AUTO"}, {"code": "M1", "number": 69, "type": "MOTO"}, {"code": "M2", "number": 70, "type": "MOTO"}, {"code": "M3", "number": 71, "type": "MOTO"}, {"code": "M4", "number": 72, "type": "MOTO"}, {"code": "DIS1", "number": 73, "type": "DISABILITY"}];

  await pool.query('BEGIN');
  try {
    // Mueve temporalmente TODOS los numbers a valores negativos únicos para evitar
    // choques con la restricción UNIQUE parking_spaces_number_key al reordenar el layout.
    await pool.query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY created_at NULLS LAST, id) AS rn
        FROM parking_spaces
      )
      UPDATE parking_spaces ps
      SET number = -100000 - ranked.rn,
          updated_at = NOW()
      FROM ranked
      WHERE ps.id = ranked.id
    `);

    for (const space of spaces) {
      await pool.query(`
        INSERT INTO parking_spaces (code, number, space_type, status, is_active, notes)
        VALUES ($1, $2, $3::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9')
        ON CONFLICT (code) DO UPDATE SET
          number = EXCLUDED.number,
          space_type = EXCLUDED.space_type,
          is_active = TRUE,
          notes = COALESCE(parking_spaces.notes, EXCLUDED.notes),
          updated_at = NOW()
      `, [space.code, space.number, space.type]);
    }

    await pool.query(`
      UPDATE parking_spaces
      SET is_active = FALSE, updated_at = NOW()
      WHERE code <> ALL($1::text[])
    `, [spaces.map((space) => space.code)]);

    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
};

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    await pool.query(`ALTER TABLE vehicle_qrs ADD COLUMN IF NOT EXISTS qr_token_value TEXT`);
    await ensureParkingLayout();
    console.log('PostgreSQL conectado correctamente');

    server.listen(env.port, () => {
      console.log(`Servidor corriendo en http://localhost:${env.port}`);
    });

    runMaintenanceJobs();
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
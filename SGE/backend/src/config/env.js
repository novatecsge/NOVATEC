const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    name: process.env.DB_NAME || 'parking',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },

  frontendUrl: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173'),

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    qrSecret: process.env.JWT_QR_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    qrExpiresIn: process.env.JWT_QR_EXPIRES_IN || '1d'
  },

  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 100)
  }
};

module.exports = env;
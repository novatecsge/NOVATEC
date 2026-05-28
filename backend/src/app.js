const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const routes = require('./routes');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

app.use(cors({
  origin(origin, callback) {
    // Permite clientes sin origin (Expo Go / apps nativas / Postman) y orígenes web permitidos.
    if (!origin || env.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use(rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'SGE-CECyT9 API',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1', routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
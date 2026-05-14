const path = require('path');
const fs = require('fs');
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

app.use(helmet({
  contentSecurityPolicy: false
}));

const allowedOrigins = [
  env.frontendUrl,
  process.env.RENDER_EXTERNAL_URL
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (env.nodeEnv !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use(rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false
}));

app.use('/api/v1', routes);

const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath, {
    index: false,
    maxAge: env.nodeEnv === 'production' ? '1d' : 0
  }));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;

const rateLimit = require('express-rate-limit');

const loginRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Intenta más tarde.',
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS'
    }
  }
});

module.exports = loginRateLimitMiddleware;
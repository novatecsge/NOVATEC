const rateLimit = require('express-rate-limit');

const createCriticalRateLimit = (max, message, code) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
      error: { code }
    }
  });

const accessScanRateLimit = createCriticalRateLimit(
  60,
  'Demasiados escaneos en poco tiempo',
  'TOO_MANY_ACCESS_SCANS'
);

const reservationRateLimit = createCriticalRateLimit(
  20,
  'Demasiadas solicitudes de reserva',
  'TOO_MANY_RESERVATIONS'
);

module.exports = {
  accessScanRateLimit,
  reservationRateLimit
};
const { body } = require('express-validator');

const scanQrDto = [
  body('qrToken')
    .notEmpty()
    .withMessage('El token QR es obligatorio'),

  body('gate')
    .optional()
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage('La puerta es inválida')
];

module.exports = {
  scanQrDto
};
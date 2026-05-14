const { body, param } = require('express-validator');

const vehicleIdParamDto = [
  param('vehicleId')
    .isUUID()
    .withMessage('ID de vehículo inválido')
];

const qrIdParamDto = [
  param('qrId')
    .isUUID()
    .withMessage('ID de QR inválido')
];

const revokeQrDto = [
  ...qrIdParamDto,
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('La razón debe tener entre 3 y 255 caracteres')
];

module.exports = {
  vehicleIdParamDto,
  qrIdParamDto,
  revokeQrDto
};
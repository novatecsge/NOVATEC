const { body, param } = require('express-validator');

const vehicleTypeValues = ['AUTO', 'MOTO'];

const createVehicleDto = [
  body('plate')
    .trim()
    .notEmpty()
    .withMessage('La placa es obligatoria')
    .isLength({ min: 5, max: 15 })
    .withMessage('La placa debe tener entre 5 y 15 caracteres'),

  body('vehicleType')
    .notEmpty()
    .withMessage('El tipo de vehículo es obligatorio')
    .isIn(vehicleTypeValues)
    .withMessage('El tipo de vehículo debe ser AUTO o MOTO'),

  body('brand')
    .trim()
    .notEmpty()
    .withMessage('La marca es obligatoria')
    .isLength({ min: 2, max: 60 }),

  body('model')
    .trim()
    .notEmpty()
    .withMessage('El modelo es obligatorio')
    .isLength({ min: 1, max: 60 }),

  body('color')
    .trim()
    .notEmpty()
    .withMessage('El color es obligatorio')
    .isLength({ min: 2, max: 40 }),

  body('year')
    .isInt({ min: 1980, max: new Date().getFullYear() + 1 })
    .withMessage('El año es inválido')
];

const updateVehicleDto = [
  param('id')
    .isUUID()
    .withMessage('ID de vehículo inválido'),

  body('brand')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 }),

  body('model')
    .optional()
    .trim()
    .isLength({ min: 1, max: 60 }),

  body('color')
    .optional()
    .trim()
    .isLength({ min: 2, max: 40 }),

  body('year')
    .optional()
    .isInt({ min: 1980, max: new Date().getFullYear() + 1 })
    .withMessage('El año es inválido')
];

const vehicleIdParamDto = [
  param('id')
    .isUUID()
    .withMessage('ID de vehículo inválido')
];

module.exports = {
  createVehicleDto,
  updateVehicleDto,
  vehicleIdParamDto
};
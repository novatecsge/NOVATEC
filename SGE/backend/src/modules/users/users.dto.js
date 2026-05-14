const { body, param } = require('express-validator');

const ipnEmailRegex = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)*ipn\.mx$/i;

const updateProfileDto = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('El nombre debe tener entre 3 y 120 caracteres'),

  body('email')
    .optional()
    .trim()
    .matches(ipnEmailRegex)
    .withMessage('Correo institucional inválido'),

  body('hasDisability')
    .optional()
    .isBoolean()
    .withMessage('hasDisability debe ser booleano')
];

const updateUserStatusDto = [
  param('id')
    .isUUID()
    .withMessage('ID de usuario inválido'),

  body('isActive')
    .isBoolean()
    .withMessage('isActive debe ser booleano'),

  body('isDisabled')
    .isBoolean()
    .withMessage('isDisabled debe ser booleano')
];

module.exports = {
  updateProfileDto,
  updateUserStatusDto
};
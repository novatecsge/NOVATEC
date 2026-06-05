const { body } = require('express-validator');

const ipnEmailRegex = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)*ipn\.mx$/i;

const registerDto = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('El nombre completo es obligatorio')
    .isLength({ min: 3, max: 120 })
    .withMessage('El nombre debe tener entre 3 y 120 caracteres'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo es obligatorio')
    .matches(ipnEmailRegex)
    .withMessage('Debes usar un correo institucional válido de IPN'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 8, max: 64 })
    .withMessage('La contraseña debe tener entre 8 y 64 caracteres'),

  body('consentAccepted')
    .isBoolean()
    .withMessage('Debes indicar si aceptas el tratamiento de datos')
];

const loginDto = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo es obligatorio')
    .matches(ipnEmailRegex)
    .withMessage('Correo institucional inválido'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
];

const refreshDto = [
  body('refreshToken')
    .notEmpty()
    .withMessage('El refresh token es obligatorio')
];

const requestPasswordResetDto = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo es obligatorio')
    .matches(ipnEmailRegex)
    .withMessage('Correo institucional inválido')
];

const resetPasswordDto = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('El token es obligatorio'),

  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 8, max: 64 })
    .withMessage('La contraseña debe tener entre 8 y 64 caracteres')
];

module.exports = {
  registerDto,
  loginDto,
  refreshDto,
  requestPasswordResetDto,
  resetPasswordDto
};
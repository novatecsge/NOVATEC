const { body, param } = require('express-validator');

const reservationStatuses = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED'
];

const createReservationDto = [
  body('vehicleId')
    .isUUID()
    .withMessage('vehicleId inválido'),

  body('requestedStartAt')
    .isISO8601()
    .withMessage('requestedStartAt debe ser una fecha válida')
    .custom((value) => {
      const now = new Date();
      const start = new Date(value);

      if (start <= now) {
        throw new Error('La reserva debe ser en el futuro');
      }

      return true;
    }),

  body('requestedEndAt')
    .isISO8601()
    .withMessage('requestedEndAt debe ser una fecha válida')
    .custom((value, { req }) => {
      const start = new Date(req.body.requestedStartAt);
      const end = new Date(value);

      if (end <= start) {
        throw new Error('requestedEndAt debe ser posterior a requestedStartAt');
      }

      return true;
    })
];

const reservationIdParamDto = [
  param('id')
    .isUUID()
    .withMessage('ID de reserva inválido')
];

const rejectReservationDto = [
  ...reservationIdParamDto,
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('La razón de rechazo es obligatoria')
    .isLength({ min: 3, max: 255 })
    .withMessage('La razón debe tener entre 3 y 255 caracteres')
];

const updateReservationStatusDto = [
  ...reservationIdParamDto,
  body('status')
    .isIn(reservationStatuses)
    .withMessage('Estado de reserva inválido')
];

module.exports = {
  createReservationDto,
  reservationIdParamDto,
  rejectReservationDto,
  updateReservationStatusDto
};

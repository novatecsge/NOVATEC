const { body, param } = require('express-validator');

const incidentStatuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];

const createIncidentDto = [
  body('incidentType')
    .trim()
    .notEmpty()
    .withMessage('El tipo de incidencia es obligatorio')
    .isLength({ min: 3, max: 50 }),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es obligatoria')
    .isLength({ min: 5, max: 1000 })
];

const updateIncidentStatusDto = [
  param('id')
    .isUUID()
    .withMessage('ID de incidencia inválido'),

  body('status')
    .isIn(incidentStatuses)
    .withMessage('Estado inválido')
];

module.exports = {
  createIncidentDto,
  updateIncidentStatusDto
};
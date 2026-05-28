const { validationResult } = require('express-validator');
const { errorResponse } = require('../shared/responses/apiResponse');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      'Datos de entrada inválidos',
      'VALIDATION_ERROR',
      422,
      errors.array()
    );
  }

  next();
};

module.exports = validateRequest;
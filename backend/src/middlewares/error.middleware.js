const { errorResponse } = require('../shared/responses/apiResponse');

const errorMiddleware = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Error interno del servidor';

  return errorResponse(res, message, code, statusCode);
};

module.exports = errorMiddleware;
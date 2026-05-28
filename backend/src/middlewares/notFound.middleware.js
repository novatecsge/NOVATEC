const { errorResponse } = require('../shared/responses/apiResponse');

const notFoundMiddleware = (_req, res) => {
  return errorResponse(res, 'Ruta no encontrada', 'NOT_FOUND', 404);
};

module.exports = notFoundMiddleware;
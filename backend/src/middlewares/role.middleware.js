const AppError = require('../shared/errors/AppError');

const roleMiddleware = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.auth || !allowedRoles.includes(req.auth.role)) {
      return next(new AppError('No tienes permisos para esta acción', 403, 'FORBIDDEN'));
    }

    next();
  };
};

module.exports = roleMiddleware;
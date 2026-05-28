const { verifyAccessToken } = require('../shared/utils/jwt');
const AppError = require('../shared/errors/AppError');

const authMiddleware = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de acceso no proporcionado', 401, 'AUTH_REQUIRED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.auth = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };

    next();
  } catch (error) {
    next(new AppError('Token inválido o expirado', 401, 'INVALID_TOKEN'));
  }
};

module.exports = authMiddleware;
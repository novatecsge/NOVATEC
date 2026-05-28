const { successResponse } = require('../../shared/responses/apiResponse');
const authService = require('./auth.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, 'Usuario registrado correctamente', result, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login({
      email: req.body.email,
      password: req.body.password,
      userAgent: req.get('user-agent') || null,
      ipAddress: req.ip || null
    });

    return successResponse(res, 'Inicio de sesión exitoso', result);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await authService.refresh(req.body);
    return successResponse(res, 'Sesión renovada correctamente', result);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword({
      userId: req.auth.userId,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword
    });
    return successResponse(res, 'Contraseña actualizada correctamente', result);
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const result = await authService.me(req.auth.userId);
    return successResponse(res, 'Perfil obtenido correctamente', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  me,
  changePassword
};
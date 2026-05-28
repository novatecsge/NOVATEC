const { successResponse } = require('../../shared/responses/apiResponse');
const usersService = require('./users.service');

const getMyProfile = async (req, res, next) => {
  try {
    const result = await usersService.getMyProfile(req.auth.userId);
    return successResponse(res, 'Perfil obtenido correctamente', result);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (_req, res, next) => {
  try {
    const result = await usersService.getAllUsers();
    return successResponse(res, 'Usuarios obtenidos correctamente', result);
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const result = await usersService.updateMyProfile(req.auth.userId, req.body);
    return successResponse(res, 'Perfil actualizado correctamente', result);
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const result = await usersService.updateUserStatus(req.auth.userId, req.params.id, req.body);
    return successResponse(res, 'Estado del usuario actualizado correctamente', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  getAllUsers,
  updateMyProfile,
  updateUserStatus
};
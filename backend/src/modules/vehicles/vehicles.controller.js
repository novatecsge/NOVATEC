const { successResponse } = require('../../shared/responses/apiResponse');
const vehiclesService = require('./vehicles.service');

const listMyVehicles = async (req, res, next) => {
  try {
    const result = await vehiclesService.listMyVehicles(req.auth.userId);
    return successResponse(res, 'Vehículos obtenidos correctamente', result);
  } catch (error) {
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const result = await vehiclesService.createVehicle(req.auth.userId, req.body);
    return successResponse(res, 'Vehículo registrado correctamente', result, 201);
  } catch (error) {
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const result = await vehiclesService.updateVehicle(req.auth.userId, req.params.id, req.body);
    return successResponse(res, 'Vehículo actualizado correctamente', result);
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const result = await vehiclesService.deleteVehicle(req.auth.userId, req.params.id);
    return successResponse(res, 'Vehículo eliminado correctamente', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMyVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
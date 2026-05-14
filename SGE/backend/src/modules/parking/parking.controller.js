const { successResponse } = require('../../shared/responses/apiResponse');
const parkingService = require('./parking.service');

const getAllSpaces = async (_req, res, next) => {
  try {
    const result = await parkingService.getAllSpaces();
    return successResponse(res, 'Espacios obtenidos correctamente', result);
  } catch (error) {
    next(error);
  }
};

const getParkingMap = async (_req, res, next) => {
  try {
    const result = await parkingService.getParkingMap();
    return successResponse(res, 'Mapa de estacionamiento obtenido correctamente', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSpaces,
  getParkingMap
};
const { successResponse } = require('../../shared/responses/apiResponse');
const qrService = require('./qr.service');

const generateOrRotateQr = async (req, res, next) => {
  try {
    const result = await qrService.generateOrRotateQr(req.auth.userId, req.params.vehicleId);
    return successResponse(res, 'QR generado correctamente', result, 201);
  } catch (error) {
    next(error);
  }
};

const getMyVehicleQr = async (req, res, next) => {
  try {
    const result = await qrService.getMyVehicleQr(req.auth.userId, req.params.vehicleId);
    return successResponse(res, 'QR obtenido correctamente', result);
  } catch (error) {
    next(error);
  }
};

const revokeQr = async (req, res, next) => {
  try {
    const result = await qrService.revokeQr(
      req.auth.userId,
      req.params.qrId,
      req.body.reason || 'MANUAL_REVOCATION'
    );
    return successResponse(res, 'QR revocado correctamente', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateOrRotateQr,
  getMyVehicleQr,
  revokeQr
};
const { successResponse } = require('../../shared/responses/apiResponse');
const accessService = require('./access.service');

const scanQr = async (req, res, next) => {
  try {
    const result = await accessService.scanQr({
      qrToken: req.body.qrToken,
      gate: req.body.gate || 'MAIN_GATE',
      actorUserId: req.auth.userId
    });

    return successResponse(res, 'Acceso procesado correctamente', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanQr
};
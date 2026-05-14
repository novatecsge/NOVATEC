const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateRequest = require('../../middlewares/validate.middleware');
const ROLES = require('../../shared/constants/roles');
const qrController = require('./qr.controller');
const { vehicleIdParamDto, revokeQrDto } = require('./qr.dto');

const router = express.Router();

router.use(authMiddleware);

router.get('/vehicle/:vehicleId', vehicleIdParamDto, validateRequest, qrController.getMyVehicleQr);
router.post('/vehicle/:vehicleId/generate', vehicleIdParamDto, validateRequest, qrController.generateOrRotateQr);
router.patch('/:qrId/revoke', roleMiddleware(ROLES.ADMIN), revokeQrDto, validateRequest, qrController.revokeQr);

module.exports = router;
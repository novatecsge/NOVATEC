const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateRequest = require('../../middlewares/validate.middleware');
const ROLES = require('../../shared/constants/roles');
const accessController = require('./access.controller');
const { scanQrDto } = require('./access.dto');

const router = express.Router();

const { accessScanRateLimit } = require('../../middlewares/criticalRateLimit.middleware');

router.use(authMiddleware);

router.post(
  '/scan',
  accessScanRateLimit,
  roleMiddleware(ROLES.GUARD, ROLES.ADMIN),
  scanQrDto,
  validateRequest,
  accessController.scanQr
);

module.exports = router;
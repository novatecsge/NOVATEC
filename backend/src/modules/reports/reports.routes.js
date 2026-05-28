const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const ROLES = require('../../shared/constants/roles');
const reportsController = require('./reports.controller');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN));

router.get('/summary', reportsController.getReportsSummary);
router.get('/monthly', reportsController.getMonthlyReport);

module.exports = router;
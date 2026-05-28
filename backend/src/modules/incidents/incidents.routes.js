const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateRequest = require('../../middlewares/validate.middleware');
const ROLES = require('../../shared/constants/roles');
const incidentsController = require('./incidents.controller');
const { createIncidentDto, updateIncidentStatusDto } = require('./incidents.dto');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createIncidentDto, validateRequest, incidentsController.createIncident);
router.get('/', roleMiddleware(ROLES.ADMIN), incidentsController.listIncidents);
router.patch(
  '/:id/status',
  roleMiddleware(ROLES.ADMIN),
  updateIncidentStatusDto,
  validateRequest,
  incidentsController.updateIncidentStatus
);

module.exports = router;
const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateRequest = require('../../middlewares/validate.middleware');
const ROLES = require('../../shared/constants/roles');
const reservationsController = require('./reservations.controller');
const {
  createReservationDto,
  reservationIdParamDto,
  rejectReservationDto
} = require('./reservations.dto');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createReservationDto, validateRequest, reservationsController.createReservation);
router.get('/my', reservationsController.getMyReservations);
router.get('/pending', roleMiddleware(ROLES.ADMIN), reservationsController.getPendingReservations);
router.patch(
  '/:id/approve',
  roleMiddleware(ROLES.ADMIN),
  reservationIdParamDto,
  validateRequest,
  reservationsController.approveReservation
);
router.patch(
  '/:id/reject',
  roleMiddleware(ROLES.ADMIN),
  rejectReservationDto,
  validateRequest,
  reservationsController.rejectReservation
);
router.patch(
  '/:id/cancel',
  reservationIdParamDto,
  validateRequest,
  reservationsController.cancelReservation
);

const { reservationRateLimit } = require('../../middlewares/criticalRateLimit.middleware');

router.post(
  '/',
  reservationRateLimit,
  createReservationDto,
  validateRequest,
  reservationsController.createReservation
);

module.exports = router;
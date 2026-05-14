const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const vehiclesRoutes = require('../modules/vehicles/vehicles.routes');
const qrRoutes = require('../modules/qr/qr.routes');
const accessRoutes = require('../modules/access/access.routes');
const reservationsRoutes = require('../modules/reservations/reservations.routes');
const parkingRoutes = require('../modules/parking/parking.routes');
const notificationsRoutes = require('../modules/notifications/notifications.routes');
const incidentsRoutes = require('../modules/incidents/incidents.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const reportsRoutes = require('../modules/reports/reports.routes');

const router = express.Router();

router.get('/health', (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API operativa',
    data: {
      service: 'SGE-CECyT9 Backend'
    }
  });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/vehicles', vehiclesRoutes);
router.use('/qr', qrRoutes);
router.use('/access', accessRoutes);
router.use('/reservations', reservationsRoutes);
router.use('/spaces', parkingRoutes);
router.use('/parking', parkingRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/incidents', incidentsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportsRoutes);

module.exports = router;
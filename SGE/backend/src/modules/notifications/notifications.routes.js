const express = require('express');
const { param } = require('express-validator');
const authMiddleware = require('../../middlewares/auth.middleware');
const validateRequest = require('../../middlewares/validate.middleware');
const notificationsController = require('./notifications.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', notificationsController.listMyNotifications);

router.patch(
  '/:id/read',
  [param('id').isUUID().withMessage('ID inválido')],
  validateRequest,
  notificationsController.markNotificationAsRead
);

router.delete(
  '/:id',
  [param('id').isUUID().withMessage('ID inválido')],
  validateRequest,
  notificationsController.deleteMyNotification
);

router.patch('/read-all', notificationsController.markAllNotificationsAsRead);

module.exports = router;
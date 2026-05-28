const { successResponse } = require('../../shared/responses/apiResponse');
const notificationsService = require('./notifications.service');

const listMyNotifications = async (req, res, next) => {
  try {
    const result = await notificationsService.listMyNotifications(req.auth.userId);
    return successResponse(res, 'Notificaciones obtenidas correctamente', result);
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const result = await notificationsService.markNotificationAsRead(req.auth.userId, req.params.id);
    return successResponse(res, 'Notificación marcada como leída', result);
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const result = await notificationsService.markAllNotificationsAsRead(req.auth.userId);
    return successResponse(res, 'Todas las notificaciones fueron marcadas como leídas', result);
  } catch (error) {
    next(error);
  }
};

const deleteMyNotification = async (req, res, next) => {
  try {
    const result = await notificationsService.deleteMyNotification(req.auth.userId, req.params.id);
    return successResponse(res, 'Notificación eliminada correctamente', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteMyNotification
};
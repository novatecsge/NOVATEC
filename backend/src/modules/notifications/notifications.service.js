const AppError = require('../../shared/errors/AppError');
const notificationsRepository = require('./notifications.repository');

const mapNotification = (notification) => ({
  id: notification.id,
  userId: notification.user_id,
  type: notification.type,
  channel: notification.channel,
  title: notification.title,
  message: notification.message,
  isRead: notification.is_read,
  readAt: notification.read_at,
  priority: notification.priority,
  relatedEntityType: notification.related_entity_type,
  relatedEntityId: notification.related_entity_id,
  createdAt: notification.created_at
});

const listMyNotifications = async (userId) => {
  const notifications = await notificationsRepository.listNotificationsByUser(userId);
  return {
    notifications: notifications.map(mapNotification)
  };
};

const markNotificationAsRead = async (userId, notificationId) => {
  const updated = await notificationsRepository.markAsRead(notificationId, userId);

  if (!updated) {
    throw new AppError('Notificación no encontrada', 404, 'NOTIFICATION_NOT_FOUND');
  }

  return {
    notification: mapNotification(updated)
  };
};

const markAllNotificationsAsRead = async (userId) => {
  await notificationsRepository.markAllAsRead(userId);
  return { success: true };
};

const deleteMyNotification = async (userId, notificationId) => {
  const deleted = await notificationsRepository.deleteNotification(notificationId, userId);

  if (!deleted) {
    throw new AppError('Notificación no encontrada', 404, 'NOTIFICATION_NOT_FOUND');
  }

  return {
    notification: mapNotification(deleted)
  };
};

module.exports = {
  listMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteMyNotification
};
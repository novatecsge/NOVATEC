import { create } from 'zustand';

const mapNotification = (notification) => ({
  id: notification.id,
  userId: notification.userId ?? notification.user_id ?? null,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  isRead: notification.isRead ?? notification.is_read ?? false,
  readAt: notification.readAt ?? notification.read_at ?? null,
  priority: notification.priority ?? 1,
  createdAt: notification.createdAt ?? notification.created_at ?? new Date().toISOString()
});

export const useNotificationStore = create((set) => ({
  notifications: [],

  setNotifications: (notifications) =>
    set({
      notifications: notifications.map(mapNotification)
    }),

  prependNotification: (notification) =>
    set((state) => ({
      notifications: [mapNotification(notification), ...state.notifications]
    })),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== id)
    }))
}));
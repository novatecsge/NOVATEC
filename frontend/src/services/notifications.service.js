import api from './api';

export const notificationsService = {
  async list() {
    const response = await api.get('/notifications');
    return response.data.data;
  },

  async markRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data.data;
  },

  async remove(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data.data;
  }
};
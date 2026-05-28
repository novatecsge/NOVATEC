import api from './api';

export const reservationsService = {
  async create(payload) {
    const response = await api.post('/reservations', payload);
    return response.data.data;
  },

  async myList() {
    const response = await api.get('/reservations/my');
    return response.data.data;
  },

  async pending() {
    const response = await api.get('/reservations/pending');
    return response.data.data;
  },

  async approve(id) {
    const response = await api.patch(`/reservations/${id}/approve`);
    return response.data.data;
  },

  async reject(id, reason) {
    const response = await api.patch(`/reservations/${id}/reject`, { reason });
    return response.data.data;
  },

  async cancel(id) {
    const response = await api.patch(`/reservations/${id}/cancel`);
    return response.data.data;
  }
};
import api from './api';

export const incidentsService = {
  async create(payload) {
    const response = await api.post('/incidents', payload);
    return response.data.data;
  },

  async list() {
    const response = await api.get('/incidents');
    return response.data.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/incidents/${id}/status`, { status });
    return response.data.data;
  }
};
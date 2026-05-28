import api, { unwrap } from './api';

export const vehiclesService = {
  async list() {
    const response = await api.get('/vehicles');
    return unwrap(response);
  },

  async create(payload) {
    const response = await api.post('/vehicles', payload);
    return unwrap(response);
  },

  async update(id, payload) {
    const response = await api.put(`/vehicles/${id}`, payload);
    return unwrap(response);
  },

  async remove(id) {
    const response = await api.delete(`/vehicles/${id}`);
    return unwrap(response);
  }
};
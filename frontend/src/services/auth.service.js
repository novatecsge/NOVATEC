
import api, { unwrap } from './api';

export const authService = {
  async login(payload) {
    const response = await api.post('/auth/login', payload);
    return unwrap(response);
  },

  async register(payload) {
    const response = await api.post('/auth/register', payload);
    return unwrap(response);
  },

  async me() {
    const response = await api.get('/auth/me');
    return unwrap(response);
  },

  async changePassword(payload) {
    const response = await api.patch('/auth/password', payload);
    return unwrap(response);
  }
};

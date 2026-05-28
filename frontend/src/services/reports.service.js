
import api from './api';

export const reportsService = {
  async summary() {
    const response = await api.get('/reports/summary');
    return response.data.data;
  },

  async monthly({ year, month }) {
    const response = await api.get('/reports/monthly', { params: { year, month } });
    return response.data.data;
  }
};

import api from './api';

export const qrService = {
  async getVehicleQr(vehicleId) {
    const response = await api.get(`/qr/vehicle/${vehicleId}`);
    return response.data.data;
  },

  async generate(vehicleId) {
    const response = await api.post(`/qr/vehicle/${vehicleId}/generate`);
    return response.data.data;
  }
};
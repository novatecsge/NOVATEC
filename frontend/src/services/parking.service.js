import api from './api';

const getMap = async () => {
  const { data } = await api.get('/parking/map');
  return data.data;
};

export const parkingService = {
  getMap
};

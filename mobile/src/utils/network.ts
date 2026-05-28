import { Platform } from 'react-native';

export const localhostHint = () => {
  if (Platform.OS === 'android') return 'En emulador Android usa http://10.0.2.2:4000/api/v1; en dispositivo físico usa la IP LAN de tu PC.';
  if (Platform.OS === 'ios') return 'En simulador iOS puede funcionar localhost; en dispositivo físico usa la IP LAN de tu Mac/PC.';
  return 'Verifica que EXPO_PUBLIC_API_URL apunte a /api/v1.';
};

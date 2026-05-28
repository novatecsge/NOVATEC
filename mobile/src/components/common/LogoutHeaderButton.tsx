import React from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { sessionStorage } from '@/storage/session.storage';
import { socketService } from '@/services/socket.service';
import { useAuthStore } from '@/store/auth.store';
import { colors } from '@/theme/colors';

export const logoutNow = async () => {
  socketService.disconnect();
  await sessionStorage.clear();
  useAuthStore.getState().logoutLocal();
};

export const LogoutHeaderButton = () => (
  <Pressable
    onPress={() => Alert.alert('Cerrar sesión', '¿Deseas salir de la app?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logoutNow }
    ])}
    style={{ paddingHorizontal: 12, paddingVertical: 6 }}
  >
    <Text style={{ color: colors.danger, fontWeight: '800' }}>Salir</Text>
  </Pressable>
);

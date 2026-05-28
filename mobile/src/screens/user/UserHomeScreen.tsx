import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { Screen } from '@/components/common/Screen';
import { useAuthStore } from '@/store/auth.store';
import { sessionStorage } from '@/storage/session.storage';
import { socketService } from '@/services/socket.service';
import { colors } from '@/theme/colors';

export const UserHomeScreen = () => {
  const user = useAuthStore((s) => s.user);
  const logoutLocal = useAuthStore((s) => s.logoutLocal);
  const logout = async () => { socketService.disconnect(); await sessionStorage.clear(); logoutLocal(); };
  return <Screen>
    <Header title="Inicio" subtitle="Extensión móvil conectada al SGE CECyT 9" />
    <Card>
      <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{String(user?.fullName || user?.full_name || user?.email || 'Usuario')}</Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>Rol: {String(user?.role || user?.role_name || 'USER')}</Text>
    </Card>
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <View style={{ flex: 1 }}><Card><Text style={{ color: colors.muted }}>Vehículos</Text><Text style={{ fontSize: 24, fontWeight: '900' }}>{String(user?.totalVehicles ?? 0)}</Text></Card></View>
      <View style={{ flex: 1 }}><Card><Text style={{ color: colors.muted }}>Sincronización</Text><Text style={{ fontSize: 18, fontWeight: '900', color: colors.success }}>Activa</Text></Card></View>
    </View>
    <Button title="Cerrar sesión" variant="outline" onPress={logout} />
  </Screen>;
};

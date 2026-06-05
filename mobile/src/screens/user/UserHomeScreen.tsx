import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { useAuthStore } from '@/store/auth.store';
import { sessionStorage } from '@/storage/session.storage';
import { socketService } from '@/services/socket.service';
import { vehiclesService } from '@/services/vehicles.service';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';
import { Vehicle } from '@/types/api';
import { roleLabel, vehicleTypeLabel } from '@/utils/labels';

const getVehiclePlate = (vehicle: Vehicle) =>
  String(vehicle.plate || vehicle.licensePlate || 'Sin placas');

const getVehicleDescription = (vehicle: Vehicle) => {
  const brand = String(vehicle.brand || '').trim();
  const model = String(vehicle.model || '').trim();
  const type = vehicleTypeLabel(String(vehicle.vehicleType || vehicle.vehicle_type || ''));

  const text = [brand, model].filter(Boolean).join(' ');

  return text ? `${type} · ${text}` : type;
};

export const UserHomeScreen = () => {
  const user = useAuthStore((s) => s.user);
  const logoutLocal = useAuthStore((s) => s.logoutLocal);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const data = await vehiclesService.list();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('No se pudieron cargar los vehículos', getErrorMessage(error));
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const logout = async () => {
    socketService.disconnect();
    await sessionStorage.clear();
    logoutLocal();
  };

  return (
    <Screen>
      <Header
        title="Inicio"
        subtitle="Bienvenido a la app móvil de NOVATEC."
      />

      <Card>
        <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>
          {String(user?.fullName || user?.full_name || user?.email || 'Usuario')}
        </Text>

        <Text style={{ color: colors.muted, marginTop: 4 }}>
          Rol: {roleLabel(String(user?.role || user?.role_name || 'USER'))}
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Card>
            <Text style={{ color: colors.muted }}>Vehículos registrados</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>
              {loadingVehicles ? '...' : vehicles.length}
            </Text>
          </Card>
        </View>

        <View style={{ flex: 1 }}>
          <Card>
            <Text style={{ color: colors.muted }}>Sincronización</Text>
            <Text style={{ fontSize: 18, fontWeight: '900', color: colors.success }}>
              Activa
            </Text>
          </Card>
        </View>
      </View>

      <Card>
        <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text, marginBottom: 8 }}>
          Mis vehículos
        </Text>

        <ListState loading={loadingVehicles} empty={!loadingVehicles && vehicles.length === 0} />

        {vehicles.map((vehicle) => (
          <View
            key={String(vehicle.id)}
            style={{
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: colors.border
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '900' }}>
              {getVehiclePlate(vehicle)}
            </Text>

            <Text style={{ color: colors.muted, marginTop: 2 }}>
              {getVehicleDescription(vehicle)}
            </Text>
          </View>
        ))}

        <Button title="Actualizar vehículos" variant="outline" onPress={loadVehicles} />
      </Card>

      <Button title="Cerrar sesión" variant="outline" onPress={logout} />
    </Screen>
  );
};

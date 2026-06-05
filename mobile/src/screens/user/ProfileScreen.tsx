import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { authService } from '@/services/auth.service';
import { vehiclesService } from '@/services/vehicles.service';
import { getErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { colors } from '@/theme/colors';
import { Vehicle } from '@/types/api';
import { formatDate, roleLabel, vehicleTypeLabel } from '@/utils/labels';

const getVehiclePlate = (vehicle: Vehicle) =>
  String(vehicle.plate || vehicle.licensePlate || 'Sin placas');

const getVehicleDescription = (vehicle: Vehicle) => {
  const brand = String(vehicle.brand || '').trim();
  const model = String(vehicle.model || '').trim();
  const type = vehicleTypeLabel(String(vehicle.vehicleType || vehicle.vehicle_type || ''));

  const text = [brand, model].filter(Boolean).join(' ');

  return text ? `${type} · ${text}` : type;
};

export const ProfileScreen = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const loadProfile = async () => {
    try {
      const profile = await authService.me();
      setUser(profile);
    } catch {
      // No se bloquea la pantalla si falla esta actualización.
    }
  };

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
    loadProfile();
    loadVehicles();
  }, []);

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Campos requeridos', 'Completa todos los campos de contraseña.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Contraseña insegura', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Confirma correctamente la nueva contraseña.');
      return;
    }

    try {
      setSavingPassword(true);

      await authService.changePassword({
        currentPassword,
        newPassword
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Alert.alert('Contraseña actualizada', 'Tu contraseña fue actualizada correctamente.');
    } catch (error) {
      Alert.alert('No se pudo cambiar la contraseña', getErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  const fullName = String(user?.fullName || user?.full_name || 'Sin nombre');
  const email = String(user?.email || 'Sin correo');
  const role = String(user?.role || user?.role_name || 'USER');
  const createdAt = String(user?.createdAt || user?.created_at || user?.registeredAt || '');

  return (
    <Screen>
      <Header
        title="Perfil"
        subtitle="Información de tu cuenta en NOVATEC SGE."
      />

      <Card>
        <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text, marginBottom: 12 }}>
          Información de la cuenta
        </Text>

        <View style={{ gap: 12 }}>
          <View>
            <Text style={{ color: colors.muted, fontWeight: '700' }}>Nombre</Text>
            <Text style={{ color: colors.text, fontWeight: '900', marginTop: 2 }}>
              {fullName}
            </Text>
          </View>

          <View>
            <Text style={{ color: colors.muted, fontWeight: '700' }}>Correo</Text>
            <Text style={{ color: colors.text, fontWeight: '900', marginTop: 2 }}>
              {email}
            </Text>
          </View>

          <View>
            <Text style={{ color: colors.muted, fontWeight: '700' }}>Rol</Text>
            <Text style={{ color: colors.text, fontWeight: '900', marginTop: 2 }}>
              {roleLabel(role)}
            </Text>
          </View>

          <View>
            <Text style={{ color: colors.muted, fontWeight: '700' }}>
              Fecha de registro
            </Text>
            <Text style={{ color: colors.text, fontWeight: '900', marginTop: 2 }}>
              {formatDate(createdAt)}
            </Text>
          </View>

          <View>
            <Text style={{ color: colors.muted, fontWeight: '700' }}>
              Vehículos registrados
            </Text>
            <Text style={{ color: colors.text, fontWeight: '900', marginTop: 2 }}>
              {loadingVehicles ? 'Cargando...' : vehicles.length}
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text, marginBottom: 8 }}>
          Vehículos registrados
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
      </Card>

      <Card>
        <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text, marginBottom: 8 }}>
          Cambiar contraseña
        </Text>

        <Input
          label="Contraseña actual"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoComplete="current-password"
        />

        <Input
          label="Nueva contraseña"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoComplete="new-password"
        />

        <Input
          label="Confirmar nueva contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="new-password"
        />

        <Button
          title="Cambiar contraseña"
          loading={savingPassword}
          onPress={changePassword}
        />
      </Card>
    </Screen>
  );
};

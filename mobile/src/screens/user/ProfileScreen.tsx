import React, { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Screen } from '@/components/common/Screen';
import { authService } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import { getErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { colors } from '@/theme/colors';

export const ProfileScreen = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [fullName, setFullName] = useState(String(user?.fullName || user?.full_name || ''));
  useEffect(() => { authService.me().then(setUser).catch(() => undefined); }, []);
  const save = async () => { try { const updated = await usersService.updateProfile({ fullName }); setUser(updated); Alert.alert('Perfil actualizado'); } catch(e) { Alert.alert('Error', getErrorMessage(e)); } };
  return <Screen><Header title="Perfil" subtitle="Datos compartidos con la plataforma web." /><Card><Text style={{ color: colors.muted, marginBottom: 8 }}>{String(user?.email || '')}</Text><Input label="Nombre completo" value={fullName} onChangeText={setFullName} /><Button title="Guardar cambios" onPress={save} /></Card></Screen>;
};

import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Screen } from '@/components/common/Screen';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/services/api';

export const ResetPasswordScreen = ({ navigation }: any) => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({ token: token.trim(), newPassword });
      Alert.alert('Contraseña actualizada', 'Ahora puedes iniciar sesión.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={{ marginTop: 40 }}>
        <Header title="Restablecer contraseña" subtitle="Ingresa el token y tu nueva contraseña." />

        <Input label="Token" value={token} onChangeText={setToken} autoCapitalize="none" />
        <Input label="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <Input label="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <Button title="Restablecer contraseña" onPress={reset} loading={loading} />
        <Button title="Volver" variant="outline" onPress={() => navigation.navigate('Login')} />
      </View>
    </Screen>
  );
};
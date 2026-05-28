import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '@/components/common/Screen';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Header } from '@/components/common/Header';
import { authService } from '@/services/auth.service';
import { sessionStorage } from '@/storage/session.storage';
import { useAuthStore } from '@/store/auth.store';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { colors } from '@/theme/colors';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, run } = useAsyncAction();

  const login = async () => {
    const session = await run(() => authService.login({ email: email.trim(), password }));
    if (!session?.accessToken) return;
    await sessionStorage.set(session);
    useAuthStore.getState().setSession(session);
  };

  return <Screen>
    <View style={{ marginTop: 40 }}>
      <Header title="SGE CECyT 9" subtitle="Acceso móvil integrado al sistema web" />
      <Input label="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={{ color: colors.danger, marginBottom: 10 }}>{error}</Text> : null}
      <Button title="Iniciar sesión" onPress={login} loading={loading} />
    </View>
  </Screen>;
};

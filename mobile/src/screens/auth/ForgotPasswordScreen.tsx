import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Screen } from '@/components/common/Screen';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const request = async () => {
    try {
      setLoading(true);
      const result: any = await authService.requestPasswordReset({ email: email.trim() });
      if (result?.resetUrl) setToken(result.resetUrl.split('token=')[1] || '');
      Alert.alert('Solicitud enviada', 'Si el correo existe, recibirás instrucciones.');
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={{ marginTop: 40 }}>
        <Header title="Recuperar contraseña" subtitle="Ingresa tu correo institucional." />

        <Input
          label="Correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {token ? (
          <Text selectable style={{ color: colors.muted, marginBottom: 10 }}>
            Token local: {token}
          </Text>
        ) : null}

        <Button title="Enviar instrucciones" onPress={request} loading={loading} />
        <Button title="Ya tengo token" variant="outline" onPress={() => navigation.navigate('ResetPassword')} />
        <Button title="Volver" variant="outline" onPress={() => navigation.navigate('Login')} />
      </View>
    </Screen>
  );
};
import React, { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Screen } from '@/components/common/Screen';
import { accessService } from '@/services/access.service';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';
import { getAccessDetails, getAccessMessage, getAccessType } from '@/utils/accessResult';

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type Props = BottomTabScreenProps<any>;

const cleanQrToken = (rawValue: string) => {
  const raw = String(rawValue || '').trim();

  if (!raw) return '';

  try {
    const parsed = JSON.parse(raw);

    return String(
      parsed?.qrToken ||
        parsed?.qr_token ||
        parsed?.token ||
        parsed?.value ||
        parsed?.data?.qrToken ||
        parsed?.data?.qr_token ||
        parsed?.data?.token ||
        raw
    ).trim();
  } catch {
    if (raw.includes('token=')) {
      try {
        const url = new URL(raw);

        return String(
          url.searchParams.get('token') ||
            url.searchParams.get('qrToken') ||
            raw
        ).trim();
      } catch {
        return raw.replace(/^"|"$/g, '').trim();
      }
    }

    return raw.replace(/^"|"$/g, '').trim();
  }
};

export const GuardScannerScreen = ({ navigation }: Props) => {
  const [permission, requestPermission] = useCameraPermissions();

  const scanningRef = useRef(false);
  const lastTokenRef = useRef('');
  const lastScanAtRef = useRef(0);

  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [manualToken, setManualToken] = useState('');

  const scan = async (data: string, source: 'camera' | 'manual' = 'camera') => {
    const cleanToken = cleanQrToken(data);

    if (!cleanToken) {
      setError('Token QR vacío o inválido.');
      setPaused(true);
      setCameraEnabled(false);
      return;
    }

    const now = Date.now();

    if (scanningRef.current || loading || paused) return;

    if (
      source === 'camera' &&
      lastTokenRef.current === cleanToken &&
      now - lastScanAtRef.current < 10000
    ) {
      return;
    }

    scanningRef.current = true;
    lastTokenRef.current = cleanToken;
    lastScanAtRef.current = now;

    Keyboard.dismiss();
    setCameraEnabled(false);
    setPaused(true);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await accessService.scanQr(cleanToken);
      setResult(response);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      scanningRef.current = false;
    }
  };

  const scanManualToken = async () => {
    const cleanToken = cleanQrToken(manualToken);

    if (!cleanToken) {
      setError('Pega o escribe un token QR válido.');
      setPaused(true);
      setCameraEnabled(false);
      return;
    }

    await scan(cleanToken, 'manual');
  };

  const resetScanner = () => {
    Keyboard.dismiss();
    scanningRef.current = false;
    setCameraEnabled(true);
    setPaused(false);
    setResult(null);
    setError(null);
    setManualToken('');
  };

  const pauseScanner = () => {
    Keyboard.dismiss();
    setCameraEnabled(false);
    setPaused(true);
  };

  if (!permission?.granted) {
    return (
      <Screen>
        <Header
          title="Escáner QR"
          subtitle="El guardia necesita permiso de cámara."
        />

        <Button title="Permitir cámara" onPress={requestPermission} />

        <Button
          title="Ir al mapa"
          variant="outline"
          onPress={() => navigation.navigate('Mapa')}
        />
      </Screen>
    );
  }

  const accessType = getAccessType(result);
  const details = getAccessDetails(result);
  const okColor = accessType === 'EXIT' ? colors.info : colors.success;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor: colors.primary }}>
        {cameraEnabled && !paused ? (
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={(event) => scan(event.data, 'camera')}
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.primary }} />
        )}

        <View
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            flexDirection: 'row',
            gap: 10
          }}
        >
          <Pressable
            onPress={() => navigation.navigate('Mapa')}
            style={{
              flex: 1,
              backgroundColor: '#ffffffee',
              padding: 12,
              borderRadius: 14,
              alignItems: 'center'
            }}
          >
            <Text style={{ fontWeight: '900', color: colors.primary }}>
              Mapa
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Avisos')}
            style={{
              flex: 1,
              backgroundColor: '#ffffffee',
              padding: 12,
              borderRadius: 14,
              alignItems: 'center'
            }}
          >
            <Text style={{ fontWeight: '900', color: colors.primary }}>
              Avisos
            </Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 32,
            maxHeight: '72%'
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 16
            }}
          >
            <Card>
              <Text style={{ fontWeight: '900', fontSize: 17 }}>
                Resultado del acceso
              </Text>

              {loading ? (
                <Text style={{ marginTop: 8 }}>
                  Procesando QR...
                </Text>
              ) : null}

              {error ? (
                <Text
                  style={{
                    color: colors.danger,
                    marginTop: 8,
                    fontWeight: '800'
                  }}
                >
                  {error}
                </Text>
              ) : null}

              {result ? (
                <View style={{ marginTop: 10 }}>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: '900',
                      color: okColor
                    }}
                  >
                    {getAccessMessage(result)}
                  </Text>

                  {details.plate ? (
                    <Text style={{ marginTop: 6, color: colors.text }}>
                      Placa:{' '}
                      <Text style={{ fontWeight: '800' }}>
                        {details.plate}
                      </Text>
                    </Text>
                  ) : null}

                  {details.space ? (
                    <Text style={{ marginTop: 4, color: colors.text }}>
                      Cajón:{' '}
                      <Text style={{ fontWeight: '800' }}>
                        {details.space}
                      </Text>
                    </Text>
                  ) : null}

                  {details.user ? (
                    <Text style={{ marginTop: 4, color: colors.text }}>
                      Usuario:{' '}
                      <Text style={{ fontWeight: '800' }}>
                        {details.user}
                      </Text>
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text style={{ color: colors.muted, marginTop: 8 }}>
                  Apunta al QR del vehículo o pega el token manualmente.
                </Text>
              )}

              <View style={{ marginTop: 12 }}>
                <Input
                  label="Token QR manual"
                  value={manualToken}
                  onChangeText={setManualToken}
                  placeholder="Pega aquí el token para validacion manual"
                  multiline={false}
                  numberOfLines={1}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={Keyboard.dismiss}
                />

                <Button
                  title="Ocultar teclado"
                  variant="outline"
                  onPress={Keyboard.dismiss}
                />

                <Button
                  title="Validar token manualmente"
                  onPress={scanManualToken}
                  loading={loading}
                />
              </View>

              <Button
                title="Escanear otro QR"
                variant="primary"
                onPress={resetScanner}
              />

              <Button
                title="Pausar cámara"
                variant="outline"
                onPress={pauseScanner}
              />

            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

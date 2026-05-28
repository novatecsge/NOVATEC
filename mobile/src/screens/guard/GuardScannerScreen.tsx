import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { Screen } from '@/components/common/Screen';
import { accessService } from '@/services/access.service';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';
import { getAccessDetails, getAccessMessage, getAccessType } from '@/utils/accessResult';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type Props = BottomTabScreenProps<any>;

export const GuardScannerScreen = ({ navigation }: Props) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const scan = async (data: string) => {
    if (locked || paused) return;
    setLocked(true);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await accessService.scanQr(data);
      setResult(response);
      setPaused(true);
    } catch(e) {
      setError(getErrorMessage(e));
      setPaused(true);
    } finally {
      setLoading(false);
      setTimeout(() => setLocked(false), 1500);
    }
  };

  if (!permission?.granted) return <Screen><Header title="Escáner QR" subtitle="El guardia necesita permiso de cámara." /><Button title="Permitir cámara" onPress={requestPermission} /><Button title="Ir al mapa" variant="outline" onPress={() => navigation.navigate('Mapa')} /></Screen>;

  const accessType = getAccessType(result);
  const details = getAccessDetails(result);
  const okColor = accessType === 'EXIT' ? colors.info : colors.success;

  return <View style={{ flex: 1, backgroundColor: colors.primary }}>
    {!paused ? <CameraView style={{ flex: 1 }} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={(event) => scan(event.data)} /> : <View style={{ flex: 1, backgroundColor: colors.primary }} />}

    <View style={{ position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', gap: 10 }}>
      <Pressable onPress={() => navigation.navigate('Mapa')} style={{ flex: 1, backgroundColor: '#ffffffee', padding: 12, borderRadius: 14, alignItems: 'center' }}><Text style={{ fontWeight: '900', color: colors.primary }}>Mapa</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('Avisos')} style={{ flex: 1, backgroundColor: '#ffffffee', padding: 12, borderRadius: 14, alignItems: 'center' }}><Text style={{ fontWeight: '900', color: colors.primary }}>Avisos</Text></Pressable>
    </View>

    <View style={{ position: 'absolute', left: 16, right: 16, bottom: 32 }}>
      <Card>
        <Text style={{ fontWeight: '900', fontSize: 17 }}>Resultado del acceso</Text>
        {loading ? <Text style={{ marginTop: 8 }}>Procesando QR...</Text> : null}
        {error ? <Text style={{ color: colors.danger, marginTop: 8, fontWeight: '800' }}>{error}</Text> : null}
        {result ? <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: '900', color: okColor }}>{getAccessMessage(result)}</Text>
          {details.plate ? <Text style={{ marginTop: 6, color: colors.text }}>Placa: <Text style={{ fontWeight: '800' }}>{details.plate}</Text></Text> : null}
          {details.space ? <Text style={{ marginTop: 4, color: colors.text }}>Cajón: <Text style={{ fontWeight: '800' }}>{details.space}</Text></Text> : null}
          {details.user ? <Text style={{ marginTop: 4, color: colors.text }}>Usuario: <Text style={{ fontWeight: '800' }}>{details.user}</Text></Text> : null}
        </View> : <Text style={{ color: colors.muted, marginTop: 8 }}>Apunta al QR del vehículo.</Text>}
        <Button title={paused ? 'Escanear otro QR' : 'Pausar cámara'} variant={paused ? 'primary' : 'outline'} onPress={() => { setPaused((value) => !value); if (paused) { setResult(null); setError(null); } }} />
        <Button title="Ir al mapa" variant="outline" onPress={() => navigation.navigate('Mapa')} />
      </Card>
    </View>
  </View>;
};

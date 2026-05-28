import React, { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { vehiclesService } from '@/services/vehicles.service';
import { qrService } from '@/services/qr.service';
import { getErrorMessage, toArray } from '@/services/api';
import { Vehicle } from '@/types/api';
import { colors } from '@/theme/colors';

const tokenOf = (qr: any) => String(qr?.token || qr?.qrToken || qr?.qr_token || qr?.qr_token_value || qr?.qrTokenValue || '');
export const QrScreen = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [qr, setQr] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const load = async () => { try { setLoading(true); const list = toArray<Vehicle>(await vehiclesService.list(), ['vehicles']); setVehicles(list); const first = list[0] ?? null; setSelected(first); if (first?.id) setQr(await qrService.getByVehicle(first.id)); } catch(e) { Alert.alert('Error', getErrorMessage(e)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const generate = async () => { if (!selected?.id) return; try { setQr(await qrService.generate(selected.id)); } catch(e) { Alert.alert('No se pudo generar', getErrorMessage(e)); } };
  const token = tokenOf(qr);
  return <Screen>
    <Header title="Código QR" subtitle="QR vigente conectado al backend real." />
    <ListState loading={loading} empty={!loading && toArray(vehicles).length === 0} />
    {selected ? <Card><Text style={{ fontWeight: '900', fontSize: 17 }}>{String(selected.plate || selected.licensePlate || 'Vehículo')}</Text><Text style={{ color: colors.muted, marginBottom: 12 }}>{[selected.brand, selected.model].filter(Boolean).join(' ')}</Text>{token ? <QRCode value={token} size={220} /> : <Text style={{ color: colors.muted }}>Este vehículo aún no tiene QR activo.</Text>}<Text selectable style={{ marginTop: 14, color: colors.muted, fontSize: 12 }}>{token}</Text><Button title={token ? 'Regenerar QR' : 'Generar QR'} onPress={generate} /></Card> : null}
  </Screen>;
};

import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
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
import { vehicleTypeLabel, formatDateTime } from '@/utils/labels';

const tokenOf = (qr: any) => {
  return String(
    qr?.token ||
      qr?.qrToken ||
      qr?.qr_token ||
      qr?.qr_token_value ||
      qr?.qrTokenValue ||
      qr?.data?.token ||
      qr?.data?.qrToken ||
      qr?.data?.qr_token ||
      qr?.data?.qr_token_value ||
      qr?.data?.qrTokenValue ||
      qr?.result?.token ||
      qr?.result?.qrToken ||
      qr?.result?.qr_token ||
      qr?.result?.qr_token_value ||
      qr?.result?.qrTokenValue ||
      qr?.qr?.token ||
      qr?.qr?.qrToken ||
      qr?.qr?.qr_token ||
      qr?.qr?.qr_token_value ||
      qr?.qr?.qrTokenValue ||
      ''
  );
};

const expiresAtOf = (qr: any) => {
  return String(
    qr?.expiresAt ||
      qr?.expires_at ||
      qr?.data?.expiresAt ||
      qr?.data?.expires_at ||
      qr?.result?.expiresAt ||
      qr?.result?.expires_at ||
      qr?.qr?.expiresAt ||
      qr?.qr?.expires_at ||
      ''
  );
};

const getVehiclePlate = (vehicle: Vehicle) =>
  String(vehicle.plate || vehicle.licensePlate || 'Sin placas');

const getVehicleLabel = (vehicle: Vehicle) => {
  const plate = getVehiclePlate(vehicle);
  const brand = String(vehicle.brand || '').trim();
  const model = String(vehicle.model || '').trim();
  const type = vehicleTypeLabel(String(vehicle.vehicleType || vehicle.vehicle_type || ''));

  const description = [brand, model].filter(Boolean).join(' ');

  return description ? `${plate} · ${description} · ${type}` : `${plate} · ${type}`;
};

export const QrScreen = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [qr, setQr] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingQr, setLoadingQr] = useState(false);

  const loadQr = async (vehicle: Vehicle) => {
    if (!vehicle?.id) return;

    try {
      setLoadingQr(true);

      const data = await qrService.getByVehicle(String(vehicle.id));

      setQr(data);
    } catch {
      setQr(null);
    } finally {
      setLoadingQr(false);
    }
  };

  const selectVehicle = async (vehicle: Vehicle) => {
    setSelected(vehicle);
    setQr(null);
    await loadQr(vehicle);
  };

  const load = async () => {
    try {
      setLoading(true);

      const list = toArray<Vehicle>(await vehiclesService.list(), ['vehicles']);

      setVehicles(list);

      const first = list[0] ?? null;
      setSelected(first);

      if (first?.id) {
        await loadQr(first);
      }
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    if (!selected?.id) return;

    try {
      setLoadingQr(true);

      const generated = await qrService.generate(String(selected.id));

      let freshQr = generated;

      try {
        freshQr = await qrService.getByVehicle(String(selected.id));
      } catch {
        freshQr = generated;
      }

      setQr(freshQr);

      const generatedToken = tokenOf(freshQr);

      if (!generatedToken) {
        Alert.alert(
          'QR generado',
          'El QR fue generado, pero la respuesta no incluyó el token para mostrarlo. Intenta presionar actualizar o vuelve a entrar a esta pantalla.'
        );
        return;
      }

      Alert.alert('QR actualizado', 'El código QR fue generado correctamente.');
    } catch (error) {
      Alert.alert('No se pudo generar', getErrorMessage(error));
    } finally {
      setLoadingQr(false);
    }
  };

  const token = tokenOf(qr);
  const expiresAt = expiresAtOf(qr);

  return (
    <Screen>
      <Header
        title="Código QR"
        subtitle="Consulta y generación de tu QR."
      />

      <ListState loading={loading} empty={!loading && vehicles.length === 0} />

      {vehicles.length > 0 ? (
        <Card>
          <Text
            style={{
              color: colors.text,
              fontWeight: '900',
              fontSize: 16,
              marginBottom: 10
            }}
          >
            Mis vehículos
          </Text>

          <View style={{ gap: 8 }}>
            {vehicles.map((vehicle) => {
              const isSelected = String(vehicle.id) === String(selected?.id);

              return (
                <Pressable
                  key={String(vehicle.id)}
                  onPress={() => selectVehicle(vehicle)}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.accent : colors.border,
                    backgroundColor: isSelected ? colors.accentSoft : colors.white
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: '900' }}>
                    {getVehicleLabel(vehicle)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            title="Actualizar"
            variant="outline"
            onPress={load}
            loading={loading}
          />
        </Card>
      ) : null}

      {selected ? (
        <Card>
          <Text style={{ fontWeight: '900', fontSize: 17, color: colors.text }}>
            {getVehiclePlate(selected)}
          </Text>

          <Text style={{ color: colors.muted, marginBottom: 12 }}>
            {getVehicleLabel(selected)}
          </Text>

          {loadingQr ? (
            <Text style={{ color: colors.muted }}>Cargando QR...</Text>
          ) : token ? (
            <View style={{ alignItems: 'center' }}>
              <QRCode value={token} size={220} />

              {expiresAt ? (
                <Text
                  style={{
                    marginTop: 12,
                    color: colors.muted,
                    fontSize: 13,
                    textAlign: 'center'
                  }}
                >
                  Expira: {formatDateTime(expiresAt)}
                </Text>
              ) : null}

              <Text
                selectable
                style={{
                  marginTop: 14,
                  color: colors.muted,
                  fontSize: 12,
                  textAlign: 'center'
                }}
              >
                {token}
              </Text>
            </View>
          ) : (
            <Text style={{ color: colors.muted }}>
              Este vehículo aún no tiene QR activo.
            </Text>
          )}

          <Button
            title={token ? 'Regenerar QR' : 'Generar QR'}
            onPress={generate}
            loading={loadingQr}
          />
        </Card>
      ) : null}
    </Screen>
  );
};

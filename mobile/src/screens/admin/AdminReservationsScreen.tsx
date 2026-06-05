import React, { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { reservationsService } from '@/services/reservations.service';
import { getErrorMessage, toArray } from '@/services/api';
import { Reservation } from '@/types/api';
import { colors } from '@/theme/colors';
import { reservationStatusLabel, formatDateTime } from '@/utils/labels';

export const AdminReservationsScreen = () => {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setItems(toArray<Reservation>(await reservationsService.pending(), ['reservations']));
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id?: string) => {
    if (!id) return;
    await reservationsService.approve(id);
    await load();
  };

  const reject = async (id?: string) => {
    if (!id) return;
    await reservationsService.reject(id, 'Rechazada desde app móvil');
    await load();
  };

  return (
    <Screen>
      <Header title="Reservas pendientes" subtitle="Aprobación y rechazo de las reservas." />
      <Button title="Actualizar" onPress={load} loading={loading} />

      <ListState loading={loading} empty={!loading && toArray(items).length === 0} />

      {toArray<Reservation>(items).map((r, index) => (
        <Card key={String(r.id || index)}>
          <Text style={{ fontWeight: '900', color: colors.text }}>
            {reservationStatusLabel(String(r.status || 'PENDING'))}
          </Text>

          <Text style={{ color: colors.muted, marginTop: 6 }}>
            {formatDateTime(String(r.requestedStartAt || r.requested_start_at || r.startTime || r.requestedDate || ''))}
          </Text>

          <Button title="Aprobar" onPress={() => approve(r.id)} />
          <Button title="Rechazar" variant="danger" onPress={() => reject(r.id)} />
        </Card>
      ))}
    </Screen>
  );
};

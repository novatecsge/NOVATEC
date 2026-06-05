import React, { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { incidentsService } from '@/services/incidents.service';
import { getErrorMessage, toArray } from '@/services/api';
import { Incident } from '@/types/api';
import { colors } from '@/theme/colors';
import { incidentStatusLabel, formatDateTime } from '@/utils/labels';

export const IncidentsAdminScreen = () => {
  const [items, setItems] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setItems(toArray<Incident>(await incidentsService.list(), ['incidents']));
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resolveIncident = async (id?: string) => {
    if (!id) return;
    await incidentsService.updateStatus(id, {
      status: 'RESOLVED',
      resolutionComment: 'Resuelto desde app móvil'
    });
    await load();
  };

  return (
    <Screen>
      <Header title="Incidentes" subtitle="Gestión administrativa de incidentes." />
      <Button title="Actualizar" onPress={load} loading={loading} />

      <ListState loading={loading} empty={!loading && toArray(items).length === 0} />

      {toArray<Incident>(items).map((i, index) => (
        <Card key={String(i.id || index)}>
          <Text style={{ fontWeight: '900', color: colors.text }}>
            {incidentStatusLabel(String(i.status || 'OPEN'))}
          </Text>

          <Text style={{ color: colors.muted, marginTop: 6 }}>
            {String(i.description || i.title || 'Sin descripción')}
          </Text>

          <Text style={{ color: colors.muted, marginTop: 6 }}>
            {formatDateTime(String(i.createdAt || i.created_at || ''))}
          </Text>

          <Button title="Marcar resuelto" onPress={() => resolveIncident(i.id)} />
        </Card>
      ))}
    </Screen>
  );
};

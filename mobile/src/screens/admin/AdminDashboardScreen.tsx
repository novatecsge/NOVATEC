import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { Screen } from '@/components/common/Screen';
import { dashboardService } from '@/services/dashboard.service';
import { getErrorMessage, toArray, toObject } from '@/services/api';
import { colors } from '@/theme/colors';

const label: Record<string, string> = {
  active_users: 'Usuarios activos',
  active_vehicles: 'Vehículos activos',
  available_spaces: 'Espacios disponibles',
  occupied_spaces: 'Espacios ocupados',
  total_spaces: 'Espacios totales',
  pending_reservations: 'Reservas pendientes',
  open_incidents: 'Incidentes abiertos',
  entries_today: 'Entradas hoy',
  exits_today: 'Salidas hoy'
};

const Metric = ({ title, value }: { title: string; value: unknown }) => (
  <View style={{ width: '47%' }}>
    <Card>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 24, marginTop: 4 }}>{String(value ?? 0)}</Text>
    </Card>
  </View>
);

export const AdminDashboardScreen = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await dashboardService.summary());
    } catch(e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const summary = toObject<Record<string, unknown>>(data?.summary ?? data);
  const today = toObject<Record<string, unknown>>(data?.today);
  const peakHours = toArray<any>(data?.peakHours, ['peakHours']);
  const usageByUser = toArray<any>(data?.usageByUser, ['usageByUser']);

  const metrics = useMemo(() => {
    const source = { ...summary, ...today };
    return Object.entries(source).filter(([, value]) => typeof value !== 'object').slice(0, 10);
  }, [data]);

  return <Screen>
    <Header title="Dashboard Admin" subtitle="Métricas reales del sistema." />
    <Button title="Actualizar" onPress={load} loading={loading} />
    {error ? <Text style={{ color: colors.danger, marginBottom: 10 }}>{error}</Text> : null}
    <View style={{ flexDirection:'row', flexWrap:'wrap', gap: 10 }}>
      {metrics.map(([key, value]) => <Metric key={key} title={label[key] || key} value={value} />)}
    </View>
    <Card>
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>Horas pico</Text>
      {peakHours.length === 0 ? <Text style={{ color: colors.muted }}>Sin datos registrados.</Text> : peakHours.slice(0, 5).map((item, index) => (
        <Text key={`${item.hour}-${index}`} style={{ color: colors.muted, marginTop: 6 }}>Hora {String(item.hour ?? 'N/D')}: {String(item.total_entries ?? item.total ?? 0)} entradas</Text>
      ))}
    </Card>
    <Card>
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>Uso por usuario</Text>
      {usageByUser.length === 0 ? <Text style={{ color: colors.muted }}>Sin datos registrados.</Text> : usageByUser.slice(0, 5).map((item, index) => (
        <Text key={`${item.id}-${index}`} style={{ color: colors.muted, marginTop: 6 }}>{String(item.full_name || item.email || 'Usuario')}: {String(item.total_entries ?? item.total_accesses ?? 0)} accesos</Text>
      ))}
    </Card>
  </Screen>;
};

import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { reportsService } from '@/services/reports.service';
import { getErrorMessage, toArray, toObject } from '@/services/api';
import { colors } from '@/theme/colors';

export const ReportsScreen = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await reportsService.summary());
    } catch(e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const report = toObject<Record<string, unknown>>(data);
  const accessHistory = toArray<any>(report.accessHistory, ['accessHistory', 'history']);
  const dailyFlow = toArray<any>(report.dailyFlow, ['dailyFlow']);
  const hourlyFlow = toArray<any>(report.hourlyFlow, ['hourlyFlow']);

  return <Screen>
    <Header title="Reportes" subtitle="Resumen administrativo y flujo mensual del backend web." />
    <Button title="Actualizar" onPress={load} loading={loading}/>
    {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
    <ListState loading={loading} empty={!loading && !data} />

    <Card>
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>Resumen</Text>
      {Object.entries(report).filter(([, value]) => typeof value !== 'object').map(([key, value]) => (
        <Text key={key} style={{ color: colors.muted, marginTop: 6 }}>{key}: {String(value)}</Text>
      ))}
    </Card>

    <Card>
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>Historial de accesos</Text>
      {accessHistory.length === 0 ? <Text style={{ color: colors.muted }}>Sin accesos registrados.</Text> : accessHistory.slice(0, 12).map((item, index) => (
        <Text key={`${item.id}-${index}`} style={{ color: colors.muted, marginTop: 8 }}>
          {String(item.access_type || item.type || 'ACCESO')} · {String(item.plate || 'Sin placa')} · {String(item.space_code || item.space || 'Sin cajón')}
        </Text>
      ))}
    </Card>

    {dailyFlow.length ? <Card><Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>Flujo diario</Text>{dailyFlow.slice(0, 8).map((item, index) => <Text key={index} style={{ color: colors.muted, marginTop: 6 }}>{JSON.stringify(item)}</Text>)}</Card> : null}
    {hourlyFlow.length ? <Card><Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>Flujo por hora</Text>{hourlyFlow.slice(0, 8).map((item, index) => <Text key={index} style={{ color: colors.muted, marginTop: 6 }}>{JSON.stringify(item)}</Text>)}</Card> : null}
  </Screen>;
};

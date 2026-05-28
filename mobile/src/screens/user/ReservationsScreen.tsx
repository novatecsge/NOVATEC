import React, { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { reservationsService } from '@/services/reservations.service';
import { vehiclesService } from '@/services/vehicles.service';
import { getErrorMessage, toArray } from '@/services/api';
import { Reservation, Vehicle } from '@/types/api';
import { colors } from '@/theme/colors';

const tomorrowRange = () => {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(8, 0, 0, 0);
  const end = new Date(start);
  end.setHours(10, 0, 0, 0);
  return { requestedStartAt: start.toISOString(), requestedEndAt: end.toISOString() };
};

export const ReservationsScreen = () => {
  const [items, setItems] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleId, setVehicleId] = useState('');
  const [startAt, setStartAt] = useState(tomorrowRange().requestedStartAt);
  const [endAt, setEndAt] = useState(tomorrowRange().requestedEndAt);

  const load = async () => {
    try {
      setLoading(true);
      const [reservations, myVehicles] = await Promise.all([reservationsService.my(), vehiclesService.list()]);
      const reservationList = toArray<Reservation>(reservations, ['reservations']);
      const vehicleList = toArray<Vehicle>(myVehicles, ['vehicles']);
      setItems(reservationList);
      setVehicles(vehicleList);
      if (!vehicleId && vehicleList[0]?.id) setVehicleId(vehicleList[0].id);
    } catch(e) { Alert.alert('Error', getErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const create = async () => {
    try { await reservationsService.create({ vehicleId, requestedStartAt: startAt, requestedEndAt: endAt }); await load(); }
    catch(e) { Alert.alert('No se pudo crear', getErrorMessage(e)); }
  };
  const cancel = async (id?: string) => { if (!id) return; try { await reservationsService.cancel(id); await load(); } catch(e) { Alert.alert('No se pudo cancelar', getErrorMessage(e)); } };
  const vehicleList = toArray<Vehicle>(vehicles, ['vehicles']);
  const itemList = toArray<Reservation>(items, ['reservations']);
  return <Screen><Header title="Reservas" subtitle="Solicitudes sujetas a aprobación administrativa." />
    <Card><Text style={{ color: colors.muted, marginBottom: 8 }}>Vehículo actual: {vehicleList.find(v => v.id === vehicleId)?.plate || vehicleList[0]?.plate || 'Sin vehículo'}</Text><Input label="vehicleId" value={vehicleId} onChangeText={setVehicleId} /><Input label="Inicio ISO" value={startAt} onChangeText={setStartAt} /><Input label="Fin ISO" value={endAt} onChangeText={setEndAt} /><Button title="Solicitar reserva" onPress={create} /></Card>
    <ListState loading={loading} empty={!loading && itemList.length===0} />
    {itemList.map((r, index) => <Card key={String(r.id || index)}><Text style={{ fontWeight:'900', color: colors.text }}>{String(r.status || 'PENDIENTE')}</Text><Text style={{ color: colors.muted }}>{String(r.requestedStartAt || r.startTime || 'Reserva')}</Text><Button title="Cancelar" variant="outline" onPress={() => cancel(r.id)} /></Card>)}
  </Screen>;
};

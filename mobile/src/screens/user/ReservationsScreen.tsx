import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { reservationsService } from '@/services/reservations.service';
import { vehiclesService } from '@/services/vehicles.service';
import { getErrorMessage } from '@/services/api';
import { Reservation, Vehicle } from '@/types/api';
import { colors } from '@/theme/colors';
import {
  formatDateTime,
  reservationStatusLabel,
  vehicleTypeLabel
} from '@/utils/labels';

type PickerState = {
  target: 'start' | 'end';
  mode: 'date' | 'time';
};

const initialStartDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(8, 0, 0, 0);
  return date;
};

const initialEndDate = () => {
  const date = initialStartDate();
  date.setHours(10, 0, 0, 0);
  return date;
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return {};
};

const getString = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

const getVehiclePlate = (vehicle: Vehicle) =>
  getString(vehicle.plate || vehicle.licensePlate, 'Sin placas');

const getVehicleLabel = (vehicle: Vehicle) => {
  const plate = getVehiclePlate(vehicle);
  const brand = getString(vehicle.brand).trim();
  const model = getString(vehicle.model).trim();
  const type = vehicleTypeLabel(getString(vehicle.vehicleType || vehicle.vehicle_type));

  const description = [brand, model].filter(Boolean).join(' ');

  return description ? `${plate} · ${description} · ${type}` : `${plate} · ${type}`;
};

const getReservationDate = (reservation: Reservation) => {
  const data = asRecord(reservation);

  return getString(
    data.requestedStartAt ||
      data.requested_start_at ||
      data.startTime ||
      data.start_time ||
      data.requestedDate ||
      data.requested_date
  );
};

const getReservationVehicle = (reservation: Reservation, vehicles: Vehicle[]) => {
  const data = asRecord(reservation);
  const nestedVehicle = asRecord(data.vehicle);

  const reservationVehicleId = getString(
    data.vehicleId ||
      data.vehicle_id ||
      nestedVehicle.id
  );

  const vehicle = vehicles.find((item) => String(item.id) === reservationVehicleId);

  if (vehicle) return getVehicleLabel(vehicle);

  const plate = getString(
    data.plate ||
      data.vehiclePlate ||
      data.vehicle_plate ||
      nestedVehicle.plate ||
      nestedVehicle.licensePlate
  );

  return plate || 'Vehículo de la reserva';
};

export const ReservationsScreen = () => {
  const [items, setItems] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [vehicleId, setVehicleId] = useState('');
  const [startAt, setStartAt] = useState<Date>(initialStartDate());
  const [endAt, setEndAt] = useState<Date>(initialEndDate());
  const [picker, setPicker] = useState<PickerState | null>(null);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => String(vehicle.id) === String(vehicleId)),
    [vehicles, vehicleId]
  );

  const load = async () => {
    try {
      setLoading(true);

      const [reservations, myVehicles] = await Promise.all([
        reservationsService.my(),
        vehiclesService.list()
      ]);

      const reservationList = Array.isArray(reservations) ? reservations : [];
      const vehicleList = Array.isArray(myVehicles) ? myVehicles : [];

      setItems(reservationList);
      setVehicles(vehicleList);

      if (!vehicleId && vehicleList[0]?.id) {
        setVehicleId(String(vehicleList[0].id));
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

  const create = async () => {
    if (!vehicleId) {
      Alert.alert(
        'Selecciona un vehículo',
        'Debes elegir un vehículo para solicitar la reserva.'
      );
      return;
    }

    if (endAt <= startAt) {
      Alert.alert(
        'Horario inválido',
        'La hora final debe ser posterior a la hora de inicio.'
      );
      return;
    }

    try {
      setSaving(true);

      await reservationsService.create({
        vehicleId,
        requestedStartAt: startAt.toISOString(),
        requestedEndAt: endAt.toISOString()
      });

      Alert.alert(
        'Reserva enviada',
        'Tu solicitud fue enviada para revisión administrativa.'
      );

      await load();
    } catch (error) {
      Alert.alert('No se pudo crear', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id?: string) => {
    if (!id) return;

    try {
      await reservationsService.cancel(id);
      Alert.alert('Reserva cancelada', 'La reserva fue cancelada correctamente.');
      await load();
    } catch (error) {
      Alert.alert('No se pudo cancelar', getErrorMessage(error));
    }
  };

  const onPickerChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!picker) return;

    if (Platform.OS === 'android') {
      setPicker(null);
    }

    if (!selectedDate) return;

    if (picker.target === 'start') {
      const nextStart = new Date(startAt);

      if (picker.mode === 'date') {
        nextStart.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
      } else {
        nextStart.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      }

      setStartAt(nextStart);

      if (endAt <= nextStart) {
        const nextEnd = new Date(nextStart);
        nextEnd.setHours(nextStart.getHours() + 1);
        setEndAt(nextEnd);
      }
    }

    if (picker.target === 'end') {
      const nextEnd = new Date(endAt);

      if (picker.mode === 'date') {
        nextEnd.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
      } else {
        nextEnd.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      }

      setEndAt(nextEnd);
    }
  };

  return (
    <Screen>
      <Header
        title="Reservas"
        subtitle="Solicitudes sujetas a aprobación."
      />

      <Card>
        <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text, marginBottom: 10 }}>
          Nueva reserva
        </Text>

        <Text style={{ color: colors.muted, fontWeight: '700', marginBottom: 8 }}>
          Vehículo
        </Text>

        {vehicles.length === 0 ? (
          <Text style={{ color: colors.danger, marginBottom: 12 }}>
            No tienes vehículos registrados. Registra un vehículo antes de solicitar una reserva.
          </Text>
        ) : (
          <View style={{ gap: 8, marginBottom: 12 }}>
            {vehicles.map((vehicle) => {
              const selected = String(vehicle.id) === String(vehicleId);

              return (
                <Pressable
                  key={String(vehicle.id)}
                  onPress={() => setVehicleId(String(vehicle.id))}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: selected ? colors.accent : colors.border,
                    backgroundColor: selected ? colors.accentSoft : colors.white
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: '900' }}>
                    {getVehicleLabel(vehicle)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={{ color: colors.muted, marginBottom: 10 }}>
          Vehículo seleccionado:{' '}
          {selectedVehicle ? getVehicleLabel(selectedVehicle) : 'Sin vehículo'}
        </Text>

        <Text style={{ color: colors.muted, fontWeight: '700', marginBottom: 8 }}>
          Inicio
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Button
              title={`Fecha: ${startAt.toLocaleDateString('es-MX')}`}
              variant="outline"
              onPress={() => setPicker({ target: 'start', mode: 'date' })}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Button
              title={`Hora: ${startAt.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
              })}`}
              variant="outline"
              onPress={() => setPicker({ target: 'start', mode: 'time' })}
            />
          </View>
        </View>

        <Text style={{ color: colors.muted, fontWeight: '700', marginBottom: 8 }}>
          Fin
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Button
              title={`Fecha: ${endAt.toLocaleDateString('es-MX')}`}
              variant="outline"
              onPress={() => setPicker({ target: 'end', mode: 'date' })}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Button
              title={`Hora: ${endAt.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
              })}`}
              variant="outline"
              onPress={() => setPicker({ target: 'end', mode: 'time' })}
            />
          </View>
        </View>

        <Button
          title="Solicitar reserva"
          loading={saving}
          onPress={create}
        />
      </Card>

      {picker ? (
        <DateTimePicker
          value={picker.target === 'start' ? startAt : endAt}
          mode={picker.mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
        />
      ) : null}

      <ListState loading={loading} empty={!loading && items.length === 0} />

      {items.map((reservation, index) => (
        <Card key={String(reservation.id || index)}>
          <Text style={{ fontWeight: '900', color: colors.text }}>
            {reservationStatusLabel(String(reservation.status || 'PENDING'))}
          </Text>

          <Text style={{ color: colors.muted, marginTop: 4 }}>
            {getReservationVehicle(reservation, vehicles)}
          </Text>

          <Text style={{ color: colors.muted, marginTop: 4 }}>
            {formatDateTime(getReservationDate(reservation))}
          </Text>

          <Button
            title="Cancelar reserva"
            variant="outline"
            onPress={() => cancel(reservation.id)}
          />
        </Card>
      ))}
    </Screen>
  );
};

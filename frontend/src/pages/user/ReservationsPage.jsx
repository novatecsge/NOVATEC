import React from 'react';
import { useEffect, useState } from 'react';
import UserLayout from '../../layouts/UserLayout';
import SectionCard from '../../components/common/SectionCard';
import ErrorAlert from '../../components/common/ErrorAlert';
import Loader from '../../components/common/Loader';
import ReservationsTable from '../../components/tables/ReservationsTable';
import { reservationsService } from '../../services/reservations.service';
import { vehiclesService } from '../../services/vehicles.service';

export default function ReservationsPage() {
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    vehicleId: '',
    requestedStartAt: '',
    requestedEndAt: ''
  });
  const [error, setError] = useState('');

  const loadAll = async (mountedRef = { current: true }) => {
    try {
      const [vehiclesData, reservationsData] = await Promise.all([
        vehiclesService.list(),
        reservationsService.myList()
      ]);

      if (!mountedRef.current) return;
      setVehicles(vehiclesData.vehicles);
      setReservations(reservationsData.reservations);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.response?.data?.message || 'No se pudieron cargar las reservas');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    const mountedRef = { current: true };
    loadAll(mountedRef);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = {
        ...form,
        requestedStartAt: new Date(form.requestedStartAt).toISOString(),
        requestedEndAt: new Date(form.requestedEndAt).toISOString()
      };

      await reservationsService.create(payload);

      setForm({
        vehicleId: '',
        requestedStartAt: '',
        requestedEndAt: ''
      });

      setLoading(true);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo crear la reserva');
      setLoading(false);
    }
  };

  return (
    <UserLayout title="Mis Reservas">
      <div style={{ display: 'grid', gap: 20 }}>
        <SectionCard title="Crear reserva">
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
            <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
              <option value="">Selecciona un vehículo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.brand}
                </option>
              ))}
            </select>

            <input
              type="datetime-local"
              value={form.requestedStartAt}
              onChange={(e) => setForm({ ...form, requestedStartAt: e.target.value })}
            />

            <input
              type="datetime-local"
              value={form.requestedEndAt}
              onChange={(e) => setForm({ ...form, requestedEndAt: e.target.value })}
            />

            <ErrorAlert message={error} />
            <button type="submit">Crear reserva</button>
          </form>
        </SectionCard>

        <SectionCard title="Historial de reservas">
          {loading ? <Loader text="Cargando reservas..." /> : <ReservationsTable reservations={reservations} />}
        </SectionCard>
      </div>
    </UserLayout>
  );
}

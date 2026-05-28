import React from 'react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import SectionCard from '../../components/common/SectionCard';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import ReservationsTable from '../../components/tables/ReservationsTable';
import { reservationsService } from '../../services/reservations.service';

export default function ReservationsAdminPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (mountedRef = { current: true }) => {
    try {
      const data = await reservationsService.pending();
      if (mountedRef.current) setReservations(data.reservations);
    } catch (err) {
      if (mountedRef.current) setError(err?.response?.data?.message || 'No se pudieron cargar las reservas');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    const mountedRef = { current: true };
    load(mountedRef);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const approve = async (id) => {
    await reservationsService.approve(id);
    await load();
  };

  const reject = async (id) => {
    const reason = window.prompt('Motivo del rechazo');
    if (!reason) return;
    await reservationsService.reject(id, reason);
    await load();
  };

  return (
    <AdminLayout title="Reservas Pendientes">
      <SectionCard title="Reservas por aprobar">
        <ErrorAlert message={error} />
        {loading ? (
          <Loader text="Cargando reservas..." />
        ) : (
          <ReservationsTable
            reservations={reservations}
            actions={(reservation) => (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => approve(reservation.id)}>Aprobar</button>
                <button onClick={() => reject(reservation.id)}>Rechazar</button>
              </div>
            )}
          />
        )}
      </SectionCard>
    </AdminLayout>
  );
}

import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import SectionCard from '../../components/common/SectionCard';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import { incidentsService } from '../../services/incidents.service';

const STATUS_LABELS = {
  OPEN: 'Abierta',
  IN_REVIEW: 'En revisión',
  RESOLVED: 'Resuelta',
  CLOSED: 'Cerrada'
};

const canMoveToInReview = (status) => status === 'OPEN';
const canResolve = (status) => status === 'OPEN' || status === 'IN_REVIEW';

export default function IncidentsAdminPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await incidentsService.list();
      setIncidents(data.incidents || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudieron cargar las incidencias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      setError('');
      setSuccess('');

      await incidentsService.updateStatus(id, status);

      setIncidents((prev) =>
        prev.map((incident) =>
          incident.id === id
            ? {
                ...incident,
                status
              }
            : incident
        )
      );

      setSuccess(
        status === 'IN_REVIEW'
          ? 'La incidencia fue marcada como En revisión.'
          : 'La incidencia fue marcada como Resuelta.'
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'No se pudo actualizar el estado de la incidencia'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout title="Incidencias">
      <SectionCard title="Gestión de incidencias">
        <ErrorAlert message={error} />

        {success ? (
          <div
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 10,
              background: '#dcfce7',
              border: '1px solid #86efac',
              color: '#166534'
            }}
          >
            {success}
          </div>
        ) : null}

        {loading ? (
          <Loader text="Cargando incidencias..." />
        ) : incidents.length === 0 ? (
          <p>No hay incidencias registradas.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {incidents.map((incident) => {
              const isUpdating = updatingId === incident.id;

              return (
                <div
                  key={incident.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <strong>Tipo:</strong> {incident.incidentType}
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <strong>Descripción:</strong> {incident.description}
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <strong>Usuario:</strong> {incident.fullName || 'N/D'} ({incident.email || 'N/D'})
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <strong>Estado:</strong> {STATUS_LABELS[incident.status] || incident.status}
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => updateStatus(incident.id, 'IN_REVIEW')}
                      disabled={isUpdating || !canMoveToInReview(incident.status)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        cursor:
                          isUpdating || !canMoveToInReview(incident.status)
                            ? 'not-allowed'
                            : 'pointer',
                        opacity:
                          isUpdating || !canMoveToInReview(incident.status) ? 0.6 : 1
                      }}
                    >
                      {isUpdating ? 'Actualizando...' : 'En revisión'}
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(incident.id, 'RESOLVED')}
                      disabled={isUpdating || !canResolve(incident.status)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        cursor:
                          isUpdating || !canResolve(incident.status)
                            ? 'not-allowed'
                            : 'pointer',
                        opacity:
                          isUpdating || !canResolve(incident.status) ? 0.6 : 1
                      }}
                    >
                      {isUpdating ? 'Actualizando...' : 'Resolver'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </AdminLayout>
  );
}
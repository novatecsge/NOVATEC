import React from 'react';
import { useState } from 'react';
import UserLayout from '../../layouts/UserLayout';
import SectionCard from '../../components/common/SectionCard';
import ErrorAlert from '../../components/common/ErrorAlert';
import { incidentsService } from '../../services/incidents.service';

export default function IncidentsPage() {
  const [form, setForm] = useState({
    incidentType: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await incidentsService.create(form);
      setForm({ incidentType: '', description: '' });
      setSuccess('Incidencia enviada correctamente.');
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo registrar la incidencia');
    }
  };

  return (
    <UserLayout title="Reportar Incidencia">
      <SectionCard title="Nueva incidencia">
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
          <input
            placeholder="Tipo de incidencia"
            value={form.incidentType}
            onChange={(e) => setForm({ ...form, incidentType: e.target.value })}
          />
          <textarea
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
          />

          <ErrorAlert message={error} />
          {success ? <p style={{ color: 'green', margin: 0 }}>{success}</p> : null}

          <button type="submit">Enviar incidencia</button>
        </form>
      </SectionCard>
    </UserLayout>
  );
}

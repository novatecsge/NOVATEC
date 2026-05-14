import React from 'react';
import { useState } from 'react';
import GuardLayout from '../../layouts/GuardLayout';
import SectionCard from '../../components/common/SectionCard';
import ErrorAlert from '../../components/common/ErrorAlert';
import api from '../../services/api';

export default function GuardAccessPage() {
  const [qrToken, setQrToken] = useState('');
  const [gate, setGate] = useState('MAIN_GATE');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);

    try {
      const response = await api.post('/access/scan', {
        qrToken,
        gate
      });

      setResult(response.data.data.access);
      setQrToken('');
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo procesar el acceso');
    }
  };

  return (
    <GuardLayout title="Control de Acceso">
      <SectionCard title="Escaneo de QR">
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 500 }}>
          <select value={gate} onChange={(e) => setGate(e.target.value)}>
            <option value="MAIN_GATE">Acceso principal</option>
            <option value="SECONDARY_GATE">Acceso secundario</option>
          </select>

          <textarea
            placeholder="Pega aquí el token QR"
            value={qrToken}
            onChange={(e) => setQrToken(e.target.value)}
            rows={6}
          />

          <ErrorAlert message={error} />
          <button type="submit">Escanear</button>
        </form>

        {result ? (
          <div style={{ marginTop: 24 }}>
            <p>Tipo de acceso: {result.accessType}</p>
            <p>Hora: {new Date(result.accessTime).toLocaleString()}</p>
            <p>Puerta: {result.gate}</p>
          </div>
        ) : null}
      </SectionCard>
    </GuardLayout>
  );
}

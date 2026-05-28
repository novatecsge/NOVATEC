import React, { useEffect, useState } from 'react';
import UserLayout from '../../layouts/UserLayout';
import SectionCard from '../../components/common/SectionCard';
import ErrorAlert from '../../components/common/ErrorAlert';
import { vehiclesService } from '../../services/vehicles.service';
import { qrService } from '../../services/qr.service';

export default function QrPage() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadVehicles = async () => {
      try {
        const data = await vehiclesService.list();
        if (mounted) {
          setVehicles(data.vehicles || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'No se pudieron cargar los vehículos');
        }
      }
    };

    loadVehicles();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadExistingQr = async () => {
      if (!selectedVehicleId) {
        setQrData(null);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await qrService.getVehicleQr(selectedVehicleId);
        if (mounted) {
          setQrData(data);
        }
      } catch (_err) {
        if (mounted) {
          setQrData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadExistingQr();

    return () => {
      mounted = false;
    };
  }, [selectedVehicleId]);

  const generateQr = async () => {
    if (!selectedVehicleId) return;

    try {
      setLoading(true);
      setError('');
      const data = await qrService.generate(selectedVehicleId);
      setQrData(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo generar el QR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout title="Mi QR">
      <SectionCard title="QR de acceso por vehículo">
        <div style={{ display: 'grid', gap: 12, maxWidth: 620 }}>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
          >
            <option value="">Selecciona un vehículo</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate}
              </option>
            ))}
          </select>

          <ErrorAlert message={error} />

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={generateQr} disabled={!selectedVehicleId || loading}>
              {loading ? 'Procesando...' : 'Generar / Obtener QR'}
            </button>

            <button onClick={generateQr} disabled={!selectedVehicleId || loading}>
              Regenerar QR
            </button>
          </div>

          {qrData ? (
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: 12,
                padding: 16,
                display: 'grid',
                gap: 12
              }}
            >
              <h3 style={{ margin: 0 }}>QR activo</h3>

              <div style={{ display: 'grid', placeItems: 'center' }}>
                <img
                  src={qrData.image}
                  alt="QR de acceso"
                  style={{ width: 280, height: 280, objectFit: 'contain' }}
                />
              </div>

              <div>
                <strong>Token:</strong>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    background: '#f6f6f6',
                    padding: 12,
                    borderRadius: 8
                  }}
                >
                  {qrData.token}
                </pre>
              </div>

              <div>
                <strong>Generado:</strong>{' '}
                {new Date(qrData.qr.issuedAt).toLocaleString()}
              </div>

              <div>
                <strong>Expira:</strong>{' '}
                {new Date(qrData.qr.expiresAt).toLocaleString()}
              </div>

              <div>
                <strong>Estado:</strong>{' '}
                {qrData.qr.isRevoked ? 'Revocado' : 'Activo'}
              </div>
            </div>
          ) : (
            selectedVehicleId && !loading ? (
              <div style={{ padding: 12, border: '1px dashed #ccc', borderRadius: 8 }}>
                Este vehículo aún no tiene un QR activo vigente. Presiona
                <strong> Generar / Obtener QR</strong>.
              </div>
            ) : null
          )}
        </div>
      </SectionCard>
    </UserLayout>
  );
}
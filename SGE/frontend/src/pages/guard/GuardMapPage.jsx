import React, { useCallback, useEffect, useState } from 'react';
import GuardLayout from '../../layouts/GuardLayout';
import SectionCard from '../../components/common/SectionCard';
import ErrorAlert from '../../components/common/ErrorAlert';
import Loader from '../../components/common/Loader';
import ParkingMap from '../../components/map/ParkingMap';
import { parkingService } from '../../services/parking.service';
import { useSocketEvent } from '../../hooks/useSocketEvent';

export default function GuardMapPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMap = useCallback(async () => {
    try {
      setError('');
      const data = await parkingService.getMap();
      setSpaces(data.spaces || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cargar el mapa operativo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  useSocketEvent('access:entry', loadMap);
  useSocketEvent('access:exit', loadMap);

  return (
    <GuardLayout title="Mapa operativo">
      <SectionCard title="Estado actual del estacionamiento">
        <ErrorAlert message={error} />
        {loading ? (
          <Loader />
        ) : (
          <ParkingMap spaces={spaces} showVehicleDetails={true} />
        )}
      </SectionCard>
    </GuardLayout>
  );
}

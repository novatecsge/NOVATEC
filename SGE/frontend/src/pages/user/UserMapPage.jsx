import React, { useCallback, useEffect, useState } from 'react';
import UserLayout from '../../layouts/UserLayout';
import SectionCard from '../../components/common/SectionCard';
import ErrorAlert from '../../components/common/ErrorAlert';
import Loader from '../../components/common/Loader';
import ParkingMap from '../../components/map/ParkingMap';
import { parkingService } from '../../services/parking.service';
import { useSocketEvent } from '../../hooks/useSocketEvent';

export default function UserMapPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMap = useCallback(async () => {
    try {
      setError('');
      const data = await parkingService.getMap();
      setSpaces(data.spaces || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cargar el mapa del estacionamiento');
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
    <UserLayout title="Mapa del estacionamiento">
      <SectionCard title="Estado actual del estacionamiento">
        <ErrorAlert message={error} />
        {loading ? (
          <Loader />
        ) : (
          <ParkingMap spaces={spaces} showVehicleDetails={false} />
        )}
      </SectionCard>
    </UserLayout>
  );
}

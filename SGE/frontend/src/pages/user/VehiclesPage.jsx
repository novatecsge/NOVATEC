import React from 'react';
import { useEffect, useState } from 'react';
import UserLayout from '../../layouts/UserLayout';
import SectionCard from '../../components/common/SectionCard';
import ErrorAlert from '../../components/common/ErrorAlert';
import Loader from '../../components/common/Loader';
import VehiclesTable from '../../components/tables/VehiclesTable';
import { vehiclesService } from '../../services/vehicles.service';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    plate: '',
    vehicleType: 'AUTO',
    brand: '',
    model: '',
    color: '',
    year: new Date().getFullYear()
  });

  const loadVehicles = async (mountedRef = { current: true }) => {
    try {
      const data = await vehiclesService.list();
      if (!mountedRef.current) return;
      setVehicles(data.vehicles);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err?.response?.data?.message || 'No se pudieron cargar los vehículos');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    const mountedRef = { current: true };
    loadVehicles(mountedRef);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await vehiclesService.create(form);
      setForm({
        plate: '',
        vehicleType: 'AUTO',
        brand: '',
        model: '',
        color: '',
        year: new Date().getFullYear()
      });
      setLoading(true);
      await loadVehicles();
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo registrar el vehículo');
      setLoading(false);
    }
  };

  return (
    <UserLayout title="Mis Vehículos">
      <div style={{ display: 'grid', gap: 20 }}>
        <SectionCard title="Registrar vehículo">
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
            <input placeholder="Placa | Ejemplo: ABC123" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} />
            <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}>
              <option value="AUTO">Auto</option>
              <option value="MOTO">Moto</option>
            </select>
            <input placeholder="Marca" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            <input placeholder="Modelo" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            <input placeholder="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            <input type="number" placeholder="Año" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
            <ErrorAlert message={error} />
            <button type="submit">Registrar vehículo</button>
          </form>
        </SectionCard>

        <SectionCard title="Vehículos registrados">
          {loading ? <Loader text="Cargando vehículos..." /> : <VehiclesTable vehicles={vehicles} />}
        </SectionCard>
      </div>
    </UserLayout>
  );
}

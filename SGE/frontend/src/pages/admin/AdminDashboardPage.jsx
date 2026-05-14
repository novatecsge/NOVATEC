import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import StatCard from '../../components/common/StatCard';
import SectionCard from '../../components/common/SectionCard';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import { FlowBarChart, TrendLineChart } from '../../components/charts/ModernCharts';
import { dashboardService } from '../../services/dashboard.service';
import { useSocketStore } from '../../store/socket.store';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const { socket } = useSocketStore();

  const load = async (mountedRef = { current: true }) => {
    try {
      setError('');
      const result = await dashboardService.summary();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(err?.response?.data?.message || 'No se pudo cargar el dashboard');
    }
  };

  useEffect(() => {
    const mountedRef = { current: true };
    load(mountedRef);
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!socket) return;
    const reload = () => load();
    socket.on('dashboard:update', reload);
    socket.on('access:entry', reload);
    socket.on('access:exit', reload);
    return () => {
      socket.off('dashboard:update', reload);
      socket.off('access:entry', reload);
      socket.off('access:exit', reload);
    };
  }, [socket]);

  const hourlyFlow = useMemo(() => (data?.hourlyFlow || []).map((item) => ({
    ...item,
    hourLabel: `${String(item.hour).padStart(2, '0')}:00`
  })), [data]);

  const dailyFlow = useMemo(() => (data?.dailyFlow || []).map((item) => ({
    ...item,
    dayLabel: item.day?.slice(5) || item.day
  })), [data]);

  const occupancyPercent = useMemo(() => {
    if (!data?.summary) return 0;
    const occupied = Number(data.summary.occupied_spaces || 0);
    const available = Number(data.summary.available_spaces || 0);
    const total = occupied + available;
    return total ? Math.round((occupied / total) * 100) : 0;
  }, [data]);

  return (
    <AdminLayout title="Dashboard">
      <ErrorAlert message={error} />

      {!data ? (
        <Loader text="Cargando dashboard ejecutivo..." />
      ) : (
        <div style={{ display: 'grid', gap: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 18 }}>
            <StatCard title="Usuarios activos" value={data.summary.active_users} hint="Cuentas habilitadas" />
            <StatCard title="Vehículos activos" value={data.summary.active_vehicles} hint="Registros vigentes" />
            <StatCard title="Disponibles" value={data.summary.available_spaces} hint="Cajones libres ahora" tone="#22c55e" />
            <StatCard title="Ocupados" value={data.summary.occupied_spaces} hint={`${occupancyPercent}% de ocupación`} tone="#ef4444" />
            <StatCard title="Reservas pendientes" value={data.summary.pending_reservations} hint="Por aprobar" tone="#f59e0b" />
            <StatCard title="Incidencias abiertas" value={data.summary.open_incidents} hint="Requieren atención" tone="#7c3aed" />
          </div>

          <div className="chart-grid">
            <SectionCard title="Accesos de hoy" subtitle="Entradas y salidas registradas durante el día actual">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))', gap: 16 }}>
                <StatCard title="Entradas" value={data.today.entries_today} hint="Vehículos que ingresaron" tone="#2563eb" />
                <StatCard title="Salidas" value={data.today.exits_today} hint="Vehículos que salieron" tone="#10b981" />
              </div>
            </SectionCard>

            <SectionCard title="Ocupación operacional" subtitle="Indicador resumido de espacios ocupados vs disponibles">
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ height: 22, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: `${occupancyPercent}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#2563eb,#7c3aed)', transition: 'width .35s ease' }} />
                </div>
                <strong style={{ fontSize: 34, letterSpacing: '-.06em' }}>{occupancyPercent}%</strong>
                <span style={{ color: '#64748b', fontWeight: 700 }}>Ocupación general del estacionamiento</span>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Flujo por hora · últimos 30 días" subtitle="Comparativa real de entradas, salidas y movimiento total por hora">
            <FlowBarChart
              data={hourlyFlow}
              xKey="hourLabel"
              bars={[
                { key: 'entries', label: 'Entradas', color: '#2563eb' },
                { key: 'exits', label: 'Salidas', color: '#10b981' },
                { key: 'total_flow', label: 'Total', color: '#7c3aed' }
              ]}
            />
          </SectionCard>

          <div className="chart-grid">
            <SectionCard title="Tendencia diaria" subtitle="Días con más flujo de vehículos">
              <TrendLineChart data={dailyFlow} xKey="dayLabel" yKey="total_flow" color="#ef4444" />
            </SectionCard>

            <SectionCard title="Horas pico" subtitle="Top de horas con mayor número de entradas">
              <div style={{ display: 'grid', gap: 10 }}>
                {(data.peakHours || []).slice(0, 8).map((item, index) => (
                  <div key={`${item.hour}-${index}`} className="modern-card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>#{index + 1} · {String(item.hour).padStart(2, '0')}:00</strong>
                    <span className="badge green">{item.total_entries} entradas</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Top días con mayor flujo" subtitle="Listado ejecutivo para análisis de demanda">
            <div style={{ display: 'grid', gap: 10 }}>
              {(data.topFlowDays || []).map((item, index) => (
                <div key={item.day} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px', alignItems: 'center', gap: 12 }}>
                  <strong>#{index + 1}</strong>
                  <div style={{ height: 12, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, Number(item.total_flow || 0) * 10)}%`, height: '100%', background: 'linear-gradient(90deg,#ef4444,#f97316)', borderRadius: 999 }} />
                  </div>
                  <span style={{ fontWeight: 850 }}>{item.day}: {item.total_flow}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </AdminLayout>
  );
}


import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import SectionCard from '../../components/common/SectionCard';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import { FlowBarChart, TrendLineChart } from '../../components/charts/ModernCharts';
import { reportsService } from '../../services/reports.service';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const createRows = (items, columns) => items.map((item) => `
  <tr>${columns.map((column) => `<td>${item[column] ?? ''}</td>`).join('')}</tr>
`).join('');

const openPrintableReport = (report) => {
  const title = `Reporte Uso de estacionamiento Mes ${months[report.month - 1]} del año ${report.year}`;
  const html = `
    <!doctype html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; color:#1f2937; margin:32px; }
          h1 { margin:0 0 6px; }
          h2 { margin-top:28px; border-bottom:2px solid #e5e7eb; padding-bottom:8px; }
          .muted { color:#64748b; }
          .kpis { display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin:18px 0; }
          .kpi { border:1px solid #e5e7eb; border-radius:8px; padding:12px; }
          .kpi strong { display:block; font-size:22px; }
          table { width:100%; border-collapse:collapse; margin-top:10px; }
          th,td { border:1px solid #e5e7eb; padding:8px; text-align:left; font-size:12px; }
          th { background:#f8fafc; }
          @media print { button { display:none; } body { margin:18mm; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="padding:10px 14px;margin-bottom:16px;">Guardar como PDF</button>
        <h1>Reporte mensual</h1>
        <div class="muted">${title}</div>
        <div class="kpis">
          <div class="kpi"><span>Accesos</span><strong>${report.totals.total_entries}</strong></div>
          <div class="kpi"><span>Salidas</span><strong>${report.totals.total_exits}</strong></div>
          <div class="kpi"><span>Flujo total</span><strong>${report.totals.total_flow}</strong></div>
          <div class="kpi"><span>Ocupación actual</span><strong>${report.occupancy.occupied_now}/${report.occupancy.total_spaces}</strong></div>
        </div>
        <h2>Accesos y salidas por día del mes</h2>
        <table><thead><tr><th>Día</th><th>Accesos</th><th>Salidas</th><th>Total</th></tr></thead><tbody>${createRows(report.daily, ['day','entries','exits','total_flow'])}</tbody></table>
        <h2>Flujo por hora en el mes</h2>
        <table><thead><tr><th>Hora</th><th>Accesos</th><th>Salidas</th><th>Total</th></tr></thead><tbody>${createRows(report.hourly, ['hour','entries','exits','total_flow'])}</tbody></table>
        <h2>Horas pico por día</h2>
        <table><thead><tr><th>Día</th><th>Hora pico</th><th>Flujo</th></tr></thead><tbody>${createRows(report.peakByDay, ['day','hour','total_flow'])}</tbody></table>
        <h2>Top días con mayor flujo del mes</h2>
        <table><thead><tr><th>Día</th><th>Flujo total</th></tr></thead><tbody>${createRows(report.topDays, ['day','total_flow'])}</tbody></table>
      </body>
    </html>`;
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
};

export default function ReportsPage() {
  const now = new Date();
  const [reports, setReports] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [error, setError] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await reportsService.summary();
        if (mounted) setReports(data);
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || 'No se pudieron cargar los reportes');
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const dailyFlow = useMemo(() => (monthly?.daily || []).map((item) => ({ ...item, dayLabel: item.day?.slice(8) })), [monthly]);
  const hourlyFlow = useMemo(() => (monthly?.hourly || []).map((item) => ({ ...item, hourLabel: `${String(item.hour).padStart(2, '0')}:00` })), [monthly]);

  const loadMonthly = async () => {
    try {
      setLoadingReport(true);
      setError('');
      const data = await reportsService.monthly({ year, month });
      setMonthly(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo generar el reporte mensual');
    } finally {
      setLoadingReport(false);
    }
  };

  const downloadPdf = async () => {
    let report = monthly;
    if (!report) {
      report = await reportsService.monthly({ year, month });
      setMonthly(report);
    }
    openPrintableReport(report);
  };

  return (
    <AdminLayout title="Reportes">
      <ErrorAlert message={error} />
      {!reports ? (
        <Loader text="Cargando reportes..." />
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          <SectionCard title="Reporte mensual" subtitle="Genera un reporte listo para guardar como PDF con accesos, salidas, ocupación y horas pico.">
            <div className="report-actions">
              <label>Mes
                <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
                  {months.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
                </select>
              </label>
              <label>Año
                <input type="number" value={year} onChange={(event) => setYear(Number(event.target.value))} />
              </label>
              <button type="button" onClick={loadMonthly} disabled={loadingReport}>{loadingReport ? 'Generando...' : 'Ver reporte'}</button>
              <button type="button" onClick={downloadPdf}>Descargar reporte PDF</button>
            </div>
          </SectionCard>

          {monthly ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <SectionCard title="Accesos"><strong style={{ fontSize: 32 }}>{monthly.totals.total_entries}</strong></SectionCard>
                <SectionCard title="Salidas"><strong style={{ fontSize: 32 }}>{monthly.totals.total_exits}</strong></SectionCard>
                <SectionCard title="Flujo total"><strong style={{ fontSize: 32 }}>{monthly.totals.total_flow}</strong></SectionCard>
                <SectionCard title="Ocupación"><strong style={{ fontSize: 32 }}>{monthly.occupancy.occupied_now}/{monthly.occupancy.total_spaces}</strong></SectionCard>
              </div>
              <SectionCard title="Accesos y salidas por día del mes">
                <TrendLineChart data={dailyFlow} xKey="dayLabel" yKey="total_flow" color="#556ee6" />
              </SectionCard>
              <SectionCard title="Flujo por hora en el mes">
                <FlowBarChart data={hourlyFlow} xKey="hourLabel" bars={[{ key: 'entries', label: 'Accesos', color: '#556ee6' }, { key: 'exits', label: 'Salidas', color: '#10b981' }, { key: 'total_flow', label: 'Total', color: '#f59e0b' }]} />
              </SectionCard>
              <div className="chart-grid">
                <SectionCard title="Horas pico por día">
                  <table><thead><tr><th>Día</th><th>Hora pico</th><th>Flujo</th></tr></thead><tbody>{monthly.peakByDay.map((item) => <tr key={item.day}><td>{item.day}</td><td>{String(item.hour).padStart(2, '0')}:00</td><td>{item.total_flow}</td></tr>)}</tbody></table>
                </SectionCard>
                <SectionCard title="Top días con mayor flujo del mes">
                  <table><thead><tr><th>Día</th><th>Flujo total</th></tr></thead><tbody>{monthly.topDays.map((item) => <tr key={item.day}><td>{item.day}</td><td>{item.total_flow}</td></tr>)}</tbody></table>
                </SectionCard>
              </div>
            </>
          ) : null}

          <div className="chart-grid">
            <SectionCard title="Historial de accesos"><p>Total registros: {reports.accessHistory.length}</p></SectionCard>
            <SectionCard title="Uso por espacio"><p>Total espacios reportados: {reports.spaceUsage.length}</p></SectionCard>
            <SectionCard title="Reservas por usuario"><p>Total usuarios en reporte: {reports.userReservations.length}</p></SectionCard>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

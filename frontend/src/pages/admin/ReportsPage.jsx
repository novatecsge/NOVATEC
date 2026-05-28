import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import SectionCard from '../../components/common/SectionCard';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import { FlowBarChart, TrendLineChart, PieDonutChart } from '../../components/charts/ModernCharts';
import { reportsService } from '../../services/reports.service';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const asArray = (value) => Array.isArray(value) ? value : [];
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

const createRows = (items, columns) => asArray(items).map((item) => `
  <tr>${columns.map((column) => `<td>${escapeHtml(item[column] ?? '')}</td>`).join('')}</tr>
`).join('');

const barSvg = (items, labelKey, valueKey, title) => {
  const data = asArray(items).slice(0, 12);
  const max = Math.max(1, ...data.map((item) => Number(item[valueKey] || 0)));
  const bars = data.map((item, index) => {
    const value = Number(item[valueKey] || 0);
    const height = Math.round((value / max) * 170);
    const x = 36 + index * 48;
    const y = 210 - height;
    return `<g><rect x="${x}" y="${y}" width="28" height="${height}" rx="5" fill="#2563eb"/><text x="${x + 14}" y="230" text-anchor="middle" font-size="10" fill="#475569">${escapeHtml(String(item[labelKey] ?? '').slice(-5))}</text><text x="${x + 14}" y="${Math.max(18, y - 8)}" text-anchor="middle" font-size="10" fill="#0f172a">${value}</text></g>`;
  }).join('');
  return `<div class="chart-box"><h3>${title}</h3><svg viewBox="0 0 660 250" role="img"><line x1="24" y1="210" x2="640" y2="210" stroke="#cbd5e1"/>${bars}</svg></div>`;
};

const lineSvg = (items, labelKey, valueKey, title) => {
  const data = asArray(items).slice(0, 16);
  const max = Math.max(1, ...data.map((item) => Number(item[valueKey] || 0)));
  const points = data.map((item, index) => {
    const x = data.length === 1 ? 330 : 34 + index * (590 / Math.max(1, data.length - 1));
    const y = 205 - (Number(item[valueKey] || 0) / max) * 165;
    return { x, y, label: item[labelKey], value: item[valueKey] };
  });
  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const circles = points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#16a34a"/><text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-size="10" fill="#0f172a">${p.value || 0}</text>`).join('');
  return `<div class="chart-box"><h3>${title}</h3><svg viewBox="0 0 660 250" role="img"><line x1="24" y1="205" x2="640" y2="205" stroke="#cbd5e1"/><polyline points="${polyline}" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${circles}</svg></div>`;
};

const pieSvg = (totalEntries, totalExits) => {
  const entries = Number(totalEntries || 0);
  const exits = Number(totalExits || 0);
  const total = Math.max(1, entries + exits);
  const entriesPct = entries / total;
  const large = entriesPct > 0.5 ? 1 : 0;
  const angle = entriesPct * Math.PI * 2;
  const x = 100 + 80 * Math.sin(angle);
  const y = 100 - 80 * Math.cos(angle);
  const path = `M 100 100 L 100 20 A 80 80 0 ${large} 1 ${x} ${y} Z`;
  return `<div class="chart-box chart-small"><h3>Distribución entradas/salidas</h3><svg viewBox="0 0 220 220" role="img"><circle cx="100" cy="100" r="80" fill="#10b981"/><path d="${path}" fill="#2563eb"/><circle cx="100" cy="100" r="44" fill="#fff"/><text x="100" y="96" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">Flujo</text><text x="100" y="115" text-anchor="middle" font-size="16" font-weight="800" fill="#0f172a">${entries + exits}</text></svg><div class="legend"><span><i style="background:#2563eb"></i>Entradas: ${entries}</span><span><i style="background:#10b981"></i>Salidas: ${exits}</span></div></div>`;
};

const openPrintableReport = (report) => {
  const safeReport = report || {};
  const totals = safeReport.totals || {};
  const occupancy = safeReport.occupancy || {};
  const title = `Reporte Uso de estacionamiento Mes ${months[(safeReport.month || 1) - 1]} del año ${safeReport.year || new Date().getFullYear()}`;
  const daily = asArray(safeReport.daily).map((item) => ({ ...item, dayLabel: String(item.day || '').slice(8) || item.day }));
  const hourly = asArray(safeReport.hourly).map((item) => ({ ...item, hourLabel: `${String(item.hour ?? 0).padStart(2, '0')}:00` }));
  const html = `
    <!doctype html>
    <html lang="es">
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; color:#0f172a; margin:30px; background:#f8fafc; }
          .page { background:#fff; border-radius:18px; padding:26px; box-shadow:0 18px 50px rgba(15,23,42,.10); }
          .header { display:flex; justify-content:space-between; gap:20px; align-items:flex-start; border-bottom:4px solid #2563eb; padding-bottom:16px; }
          h1 { margin:0 0 6px; font-size:30px; } h2 { margin-top:28px; border-bottom:1px solid #e2e8f0; padding-bottom:8px; } h3 { margin:0 0 10px; font-size:16px; }
          .muted { color:#64748b; } .badge { background:#dbeafe; color:#1d4ed8; border-radius:999px; padding:8px 12px; font-weight:700; }
          .kpis { display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin:22px 0; }
          .kpi { border:1px solid #e2e8f0; border-radius:14px; padding:14px; background:linear-gradient(180deg,#fff,#f8fafc); }
          .kpi span { color:#64748b; } .kpi strong { display:block; font-size:28px; margin-top:5px; }
          .charts { display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin:18px 0; }
          .chart-box { border:1px solid #e2e8f0; border-radius:14px; padding:14px; background:#fff; page-break-inside:avoid; } .chart-small { display:grid; place-items:start; }
          .legend span { display:block; margin:4px 0; color:#475569; } .legend i { display:inline-block; width:11px; height:11px; border-radius:2px; margin-right:6px; }
          table { width:100%; border-collapse:collapse; margin-top:10px; background:#fff; } th,td { border:1px solid #e2e8f0; padding:8px; text-align:left; font-size:12px; } th { background:#eff6ff; color:#1e3a8a; }
          .print-btn { padding:11px 16px; margin-bottom:16px; background:#2563eb; color:#fff; border:0; border-radius:10px; font-weight:700; }
          @media print { body { margin:12mm; background:#fff; } .page { box-shadow:none; padding:0; } .print-btn { display:none; } .charts { grid-template-columns:1fr 1fr; } }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Guardar como PDF</button>
        <main class="page">
          <div class="header"><div><h1>Reporte mensual</h1><div class="muted">${escapeHtml(title)}</div></div><div class="badge">NOVATEC · SGE CECyT 9</div></div>
          <div class="kpis">
            <div class="kpi"><span>Accesos</span><strong>${totals.total_entries || 0}</strong></div>
            <div class="kpi"><span>Salidas</span><strong>${totals.total_exits || 0}</strong></div>
            <div class="kpi"><span>Flujo total</span><strong>${totals.total_flow || 0}</strong></div>
            <div class="kpi"><span>Ocupación actual</span><strong>${occupancy.occupied_now || 0}/${occupancy.total_spaces || 0}</strong></div>
          </div>
          <div class="charts">${barSvg(daily, 'dayLabel', 'total_flow', 'Flujo diario')}${lineSvg(hourly, 'hourLabel', 'total_flow', 'Tendencia por hora')}${pieSvg(totals.total_entries, totals.total_exits)}</div>
          <h2>Accesos y salidas por día del mes</h2>
          <table><thead><tr><th>Día</th><th>Accesos</th><th>Salidas</th><th>Total</th></tr></thead><tbody>${createRows(safeReport.daily, ['day','entries','exits','total_flow'])}</tbody></table>
          <h2>Flujo por hora en el mes</h2>
          <table><thead><tr><th>Hora</th><th>Accesos</th><th>Salidas</th><th>Total</th></tr></thead><tbody>${createRows(safeReport.hourly, ['hour','entries','exits','total_flow'])}</tbody></table>
          <h2>Horas pico por día</h2>
          <table><thead><tr><th>Día</th><th>Hora pico</th><th>Flujo</th></tr></thead><tbody>${createRows(safeReport.peakByDay, ['day','hour','total_flow'])}</tbody></table>
          <h2>Top días con mayor flujo del mes</h2>
          <table><thead><tr><th>Día</th><th>Flujo total</th></tr></thead><tbody>${createRows(safeReport.topDays, ['day','total_flow'])}</tbody></table>
        </main>
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

  const dailyFlow = useMemo(() => asArray(monthly?.daily).map((item) => ({ ...item, dayLabel: item.day?.slice(8) })), [monthly]);
  const hourlyFlow = useMemo(() => asArray(monthly?.hourly).map((item) => ({ ...item, hourLabel: `${String(item.hour).padStart(2, '0')}:00` })), [monthly]);
  const weeklyFlow = useMemo(() => {
    const groups = asArray(monthly?.daily).reduce((acc, item) => {
      const dayNumber = Number(String(item.day || '').slice(8)) || 1;
      const week = Math.ceil(dayNumber / 7);
      const key = `Semana ${week}`;
      acc[key] = acc[key] || { weekLabel: key, entries: 0, exits: 0, total_flow: 0 };
      acc[key].entries += Number(item.entries || 0);
      acc[key].exits += Number(item.exits || 0);
      acc[key].total_flow += Number(item.total_flow || 0);
      return acc;
    }, {});
    return Object.values(groups);
  }, [monthly]);

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
          <SectionCard title="Reporte mensual" subtitle="Genera un reporte listo para guardar como PDF con gráficas, accesos, salidas, ocupación y horas pico.">
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
              <div className="report-kpi-grid">
                <div className="report-kpi"><span>Accesos</span><strong>{monthly.totals?.total_entries || 0}</strong></div>
                <div className="report-kpi"><span>Salidas</span><strong>{monthly.totals?.total_exits || 0}</strong></div>
                <div className="report-kpi"><span>Flujo total</span><strong>{monthly.totals?.total_flow || 0}</strong></div>
                <div className="report-kpi"><span>Ocupación</span><strong>{monthly.occupancy?.occupied_now || 0}/{monthly.occupancy?.total_spaces || 0}</strong></div>
              </div>
              <SectionCard title="Accesos y salidas por día del mes"><TrendLineChart data={dailyFlow} xKey="dayLabel" yKey="total_flow" color="#556ee6" /></SectionCard>
              <SectionCard title="Flujo por hora en el mes"><FlowBarChart data={hourlyFlow} xKey="hourLabel" bars={[{ key: 'entries', label: 'Accesos', color: '#556ee6' }, { key: 'exits', label: 'Salidas', color: '#10b981' }, { key: 'total_flow', label: 'Total', color: '#f59e0b' }]} /></SectionCard>
              <SectionCard title="Distribución entradas/salidas" subtitle="Comparativo mensual del flujo total"><PieDonutChart entries={monthly.totals?.total_entries} exits={monthly.totals?.total_exits} /></SectionCard>
              <SectionCard title="Tendencia semanal de flujo de accesos" subtitle="Agrupación premium por semanas del mes con entradas acumuladas, salidas y flujo total.">
                <FlowBarChart data={weeklyFlow} xKey="weekLabel" height={300} bars={[{ key: 'entries', label: 'Accesos', color: '#7c3aed' }, { key: 'exits', label: 'Salidas', color: '#06b6d4' }, { key: 'total_flow', label: 'Flujo total', color: '#f59e0b' }]} />
              </SectionCard>
              <div className="chart-grid">
                <SectionCard title="Horas pico por día"><div className="table-shell"><table><thead><tr><th>Día</th><th>Hora pico</th><th>Flujo</th></tr></thead><tbody>{asArray(monthly.peakByDay).map((item) => <tr key={item.day}><td>{item.day}</td><td>{String(item.hour).padStart(2, '0')}:00</td><td>{item.total_flow}</td></tr>)}</tbody></table></div></SectionCard>
                <SectionCard title="Top días con mayor flujo del mes"><div className="table-shell"><table><thead><tr><th>Día</th><th>Flujo total</th></tr></thead><tbody>{asArray(monthly.topDays).map((item) => <tr key={item.day}><td>{item.day}</td><td>{item.total_flow}</td></tr>)}</tbody></table></div></SectionCard>
              </div>
            </>
          ) : null}

          <div className="chart-grid">
            <SectionCard title="Historial de accesos"><p>Total registros: {asArray(reports.accessHistory).length}</p></SectionCard>
            <SectionCard title="Uso por espacio"><p>Total espacios reportados: {asArray(reports.spaceUsage).length}</p></SectionCard>
            <SectionCard title="Reservas por usuario"><p>Total usuarios en reporte: {asArray(reports.userReservations).length}</p></SectionCard>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { reportsService } from '@/services/reports.service';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
];

const currentYear = new Date().getFullYear();
const YEARS = [2026, currentYear - 1, currentYear, currentYear + 1]
  .filter((value, index, array) => array.indexOf(value) === index)
  .sort((a, b) => a - b);

const toNumber = (value: unknown) => Number(value || 0);
const arr = (value: unknown): any[] => (Array.isArray(value) ? value : []);
const sum = (items: any[], key: string) =>
  items.reduce((total, item) => total + toNumber(item?.[key]), 0);

const getDaily = (report: any) =>
  arr(report?.daily || report?.dailyFlow || report?.daily_flow);

const getHourly = (report: any) =>
  arr(report?.hourly || report?.hourlyFlow || report?.hourly_flow);

const getWeekly = (report: any) =>
  arr(report?.weekly || report?.weeklyTrend || report?.weekly_trend);

const getPeakByDay = (report: any) =>
  arr(report?.peakByDay || report?.peak_by_day || report?.peaks);

const getTopDays = (report: any) =>
  arr(report?.topDays || report?.top_days);

const getOccupancy = (report: any) => {
  const occupied = toNumber(
    report?.occupancy?.occupied_now ||
      report?.occupancy?.occupiedNow ||
      report?.occupied_now ||
      report?.occupiedNow
  );

  const total = toNumber(
    report?.occupancy?.total_spaces ||
      report?.occupancy?.totalSpaces ||
      report?.total_spaces ||
      report?.totalSpaces ||
      73
  );

  return { occupied, total };
};

const getTotals = (report: any) => {
  const daily = getDaily(report);

  const entries =
    toNumber(report?.totals?.total_entries) ||
    toNumber(report?.totals?.totalEntries) ||
    toNumber(report?.total_entries) ||
    toNumber(report?.totalEntries) ||
    sum(daily, 'entries');

  const exits =
    toNumber(report?.totals?.total_exits) ||
    toNumber(report?.totals?.totalExits) ||
    toNumber(report?.total_exits) ||
    toNumber(report?.totalExits) ||
    sum(daily, 'exits');

  const total =
    toNumber(report?.totals?.total_flow) ||
    toNumber(report?.totals?.totalFlow) ||
    toNumber(report?.total_flow) ||
    toNumber(report?.totalFlow) ||
    entries + exits ||
    sum(daily, 'total_flow');

  return { entries, exits, total };
};

const getItemTotal = (item: any) =>
  toNumber(item?.total_flow || item?.totalFlow || item?.total || item?.flow);

const getItemEntries = (item: any) =>
  toNumber(item?.entries || item?.accesses || item?.access_count);

const getItemExits = (item: any) =>
  toNumber(item?.exits || item?.exit_count);

const getItemDay = (item: any, index: number) =>
  String(item?.day || item?.date || index + 1);

const getItemHour = (item: any, index: number) =>
  String(item?.hour ?? index).padStart(2, '0');

const BarChart = ({
  title,
  data,
  labelType = 'day'
}: {
  title: string;
  data: any[];
  labelType?: 'day' | 'hour';
}) => {
  const width = 320;
  const height = 190;
  const padding = 28;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const max = Math.max(1, ...data.map(getItemTotal));
  const barGap = 5;
  const barWidth = Math.max(5, chartWidth / Math.max(1, data.length) - barGap);

  return (
    <Card>
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18, marginBottom: 10 }}>
        {title}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <Svg width={Math.max(width, data.length * 18)} height={height}>
          {[0, 1, 2, 3].map((line) => {
            const y = padding + (chartHeight / 3) * line;
            return (
              <Line
                key={line}
                x1={padding}
                y1={y}
                x2={Math.max(width, data.length * 18) - padding}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            );
          })}

          {data.map((item, index) => {
            const value = getItemTotal(item);
            const h = (value / max) * chartHeight;
            const x = padding + index * (barWidth + barGap);
            const y = padding + chartHeight - h;
            const label =
              labelType === 'hour'
                ? `${getItemHour(item, index)}`
                : getItemDay(item, index).slice(-2);

            return (
              <React.Fragment key={`${label}-${index}`}>
                <Rect x={x} y={y} width={barWidth} height={h} rx={5} fill="#2563eb" />
                <SvgText
                  x={x + barWidth / 2}
                  y={height - 8}
                  fontSize="8"
                  fill="#64748b"
                  textAnchor="middle"
                >
                  {label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </ScrollView>
    </Card>
  );
};

const LineChart = ({ title, data }: { title: string; data: any[] }) => {
  const width = 320;
  const height = 190;
  const padding = 28;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const max = Math.max(1, ...data.map(getItemTotal));

  const points = data
    .map((item, index) => {
      const x = padding + (index / Math.max(1, data.length - 1)) * chartWidth;
      const y = padding + chartHeight - (getItemTotal(item) / max) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Card>
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18, marginBottom: 10 }}>
        {title}
      </Text>

      <Svg width={width} height={height}>
        {[0, 1, 2, 3].map((line) => {
          const y = padding + (chartHeight / 3) * line;
          return (
            <Line
              key={line}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        <Polyline points={points} fill="none" stroke="#16a34a" strokeWidth="4" />

        {data.map((item, index) => {
          const x = padding + (index / Math.max(1, data.length - 1)) * chartWidth;
          const y = padding + chartHeight - (getItemTotal(item) / max) * chartHeight;

          return <Circle key={index} cx={x} cy={y} r={4} fill="#16a34a" />;
        })}
      </Svg>
    </Card>
  );
};

const DonutChart = ({ entries, exits, total }: { entries: number; exits: number; total: number }) => {
  const size = 220;
  const radius = 78;
  const stroke = 34;
  const circumference = 2 * Math.PI * radius;
  const entriesRatio = total > 0 ? entries / total : 0;
  const entriesDash = circumference * entriesRatio;
  const exitsDash = circumference - entriesDash;

  return (
    <Card>
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18, marginBottom: 10 }}>
        Distribución entradas/salidas
      </Text>

      <View style={{ alignItems: 'center' }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={stroke}
            fill="none"
          />

          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2563eb"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${entriesDash} ${circumference}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />

          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10b981"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${exitsDash} ${circumference}`}
            strokeDashoffset={-entriesDash}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />

          <SvgText
            x={size / 2}
            y={size / 2 - 5}
            fontSize="16"
            fill="#64748b"
            fontWeight="700"
            textAnchor="middle"
          >
            Total
          </SvgText>

          <SvgText
            x={size / 2}
            y={size / 2 + 24}
            fontSize="30"
            fill="#0f172a"
            fontWeight="900"
            textAnchor="middle"
          >
            {total}
          </SvgText>
        </Svg>

        <Text style={{ color: colors.muted, marginTop: 8 }}>Entradas: {entries}</Text>
        <Text style={{ color: colors.muted }}>Salidas: {exits}</Text>
      </View>
    </Card>
  );
};

const htmlBarChart = (data: any[], title: string, labelType: 'day' | 'hour') => {
  const max = Math.max(1, ...data.map(getItemTotal));

  return `
    <section class="card">
      <h2>${title}</h2>
      <div class="bars">
        ${data
          .map((item, index) => {
            const value = getItemTotal(item);
            const height = Math.max(4, Math.round((value / max) * 120));
            const label =
              labelType === 'hour'
                ? `${getItemHour(item, index)}`
                : getItemDay(item, index).slice(-2);

            return `
              <div class="bar-item">
                <span class="bar-value">${value}</span>
                <div class="bar" style="height:${height}px"></div>
                <span class="bar-label">${label}</span>
              </div>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
};

const htmlLineChart = (data: any[], title: string) => {
  const width = 680;
  const height = 210;
  const padding = 30;
  const max = Math.max(1, ...data.map(getItemTotal));

  const points = data
    .map((item, index) => {
      const x = padding + (index / Math.max(1, data.length - 1)) * (width - padding * 2);
      const y = padding + (height - padding * 2) - (getItemTotal(item) / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return `
    <section class="card">
      <h2>${title}</h2>
      <svg width="${width}" height="${height}">
        <polyline points="${points}" fill="none" stroke="#16a34a" stroke-width="4" />
        ${data
          .map((item, index) => {
            const x = padding + (index / Math.max(1, data.length - 1)) * (width - padding * 2);
            const y = padding + (height - padding * 2) - (getItemTotal(item) / max) * (height - padding * 2);
            return `<circle cx="${x}" cy="${y}" r="4" fill="#16a34a" />`;
          })
          .join('')}
      </svg>
    </section>
  `;
};

const buildPdfHtml = (report: any, month: number, year: number) => {
  const daily = getDaily(report);
  const hourly = getHourly(report);
  const weekly = getWeekly(report);
  const peakByDay = getPeakByDay(report);
  const topDays = getTopDays(report);
  const { entries, exits, total } = getTotals(report);
  const occupancy = getOccupancy(report);

  const tableRows = (items: any[], columns: string[]) =>
    items
      .map(
        (item, index) => `
        <tr>
          ${columns
            .map((col) => {
              if (col === 'day') return `<td>${getItemDay(item, index)}</td>`;
              if (col === 'hour') return `<td>${getItemHour(item, index)}:00</td>`;
              if (col === 'entries') return `<td>${getItemEntries(item)}</td>`;
              if (col === 'exits') return `<td>${getItemExits(item)}</td>`;
              if (col === 'total_flow') return `<td>${getItemTotal(item)}</td>`;
              return `<td>${String(item?.[col] ?? '')}</td>`;
            })
            .join('')}
        </tr>
      `
      )
      .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #0f172a; background:#ffffff; }
          h1 { font-size: 34px; margin: 0; }
          h2 { font-size: 22px; margin: 0 0 14px; }
          .subtitle { color:#334155; font-size:18px; margin-top:8px; }
          .brand { color:#2563eb; font-weight:900; text-align:right; }
          .top { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:6px solid #2563eb; padding-bottom:20px; margin-bottom:26px; }
          .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:26px; }
          .kpi { border:1px solid #e2e8f0; border-radius:16px; padding:16px; }
          .kpi span { color:#475569; font-size:18px; }
          .kpi strong { display:block; font-size:34px; margin-top:8px; }
          .grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
          .card { border:1px solid #e2e8f0; border-radius:18px; padding:18px; margin-bottom:20px; page-break-inside:avoid; }
          .bars { height:170px; display:flex; align-items:flex-end; gap:8px; border-bottom:1px solid #cbd5e1; padding:10px 8px 22px; overflow:hidden; }
          .bar-item { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; min-width:14px; }
          .bar { width:16px; background:#2563eb; border-radius:6px 6px 0 0; }
          .bar-value { font-size:9px; color:#334155; margin-bottom:4px; }
          .bar-label { font-size:9px; color:#64748b; margin-top:4px; }
          table { width:100%; border-collapse:collapse; margin-top:12px; }
          th, td { border:1px solid #e2e8f0; padding:8px; font-size:12px; text-align:left; }
          th { background:#eff6ff; color:#1d4ed8; }
          .donut { display:flex; align-items:center; gap:34px; }
          .donut-circle { width:230px; height:230px; border-radius:50%; background:conic-gradient(#2563eb 0 ${entries / Math.max(1,total) * 360}deg, #10b981 0 360deg); display:grid; place-items:center; }
          .donut-inner { width:118px; height:118px; border-radius:50%; background:white; display:grid; place-items:center; font-size:28px; font-weight:900; }
        </style>
      </head>

      <body>
        <section class="top">
          <div>
            <h1>Reporte mensual</h1>
            <p class="subtitle">Reporte Uso de estacionamiento Mes ${MONTHS[month - 1].label} del año ${year}</p>
          </div>
          <div class="brand">NOVATEC · SGE CECyT 9</div>
        </section>

        <section class="kpis">
          <div class="kpi"><span>Accesos</span><strong>${entries}</strong></div>
          <div class="kpi"><span>Salidas</span><strong>${exits}</strong></div>
          <div class="kpi"><span>Flujo total</span><strong>${total}</strong></div>
          <div class="kpi"><span>Ocupación actual</span><strong>${occupancy.occupied}/${occupancy.total}</strong></div>
        </section>

        <section class="grid">
          ${htmlBarChart(daily.slice(0, 12), 'Flujo diario', 'day')}
          ${htmlLineChart(hourly, 'Tendencia por hora')}
        </section>

        <section class="card">
          <h2>Distribución entradas/salidas</h2>
          <div class="donut">
            <div class="donut-circle"><div class="donut-inner">${total}</div></div>
            <div>
              <h2>Entradas: ${entries}</h2>
              <h2>Salidas: ${exits}</h2>
              <p>Balance operativo mensual</p>
            </div>
          </div>
        </section>

        ${weekly.length ? htmlBarChart(weekly, 'Tendencia semanal de flujo', 'day') : ''}

        <section class="card">
          <h2>Accesos y salidas por día del mes</h2>
          <table>
            <thead><tr><th>Día</th><th>Accesos</th><th>Salidas</th><th>Total</th></tr></thead>
            <tbody>${tableRows(daily, ['day', 'entries', 'exits', 'total_flow'])}</tbody>
          </table>
        </section>

        <section class="card">
          <h2>Flujo por hora en el mes</h2>
          <table>
            <thead><tr><th>Hora</th><th>Accesos</th><th>Salidas</th><th>Total</th></tr></thead>
            <tbody>${tableRows(hourly, ['hour', 'entries', 'exits', 'total_flow'])}</tbody>
          </table>
        </section>

        <section class="card">
          <h2>Horas pico por día</h2>
          <table>
            <thead><tr><th>Día</th><th>Hora pico</th><th>Flujo</th></tr></thead>
            <tbody>${tableRows(peakByDay, ['day', 'hour', 'total_flow'])}</tbody>
          </table>
        </section>

        <section class="card">
          <h2>Top días con mayor flujo del mes</h2>
          <table>
            <thead><tr><th>Día</th><th>Flujo total</th></tr></thead>
            <tbody>${tableRows(topDays, ['day', 'total_flow'])}</tbody>
          </table>
        </section>
      </body>
    </html>
  `;
};

export const ReportsScreen = () => {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [monthly, setMonthly] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const daily = getDaily(monthly);
  const hourly = getHourly(monthly);
  const weekly = getWeekly(monthly);
  const peakByDay = getPeakByDay(monthly);
  const topDays = getTopDays(monthly);
  const { entries, exits, total } = getTotals(monthly);
  const occupancy = getOccupancy(monthly);

  const loadMonthly = async () => {
    try {
      setLoading(true);
      const data = await reportsService.monthly({ month, year });
      setMonthly(data);
    } catch (error) {
      Alert.alert('No se pudo cargar el reporte', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonthly();
  }, [month, year]);

  const downloadPdf = async () => {
    if (!monthly) {
      Alert.alert('Genera primero el reporte');
      return;
    }

    try {
      const html = buildPdfHtml(monthly, month, year);
      const file = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir reporte mensual'
        });
      } else {
        Alert.alert('PDF generado', file.uri);
      }
    } catch (error) {
      Alert.alert('No se pudo generar el PDF', getErrorMessage(error));
    }
  };

  return (
    <Screen>
      <Header title="Reportes" subtitle="Reporte mensual del estacionamiento." />

      <Card>
        <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>
          Seleccionar mes
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {MONTHS.map((item) => {
            const selected = month === item.value;

            return (
              <Pressable
                key={item.value}
                onPress={() => setMonth(item.value)}
                style={{
                  paddingVertical: 9,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: selected ? colors.accent : colors.border,
                  backgroundColor: selected ? colors.accentSoft : colors.white
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '800' }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18, marginTop: 18 }}>
          Seleccionar año
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {YEARS.map((item) => {
            const selected = year === item;

            return (
              <Pressable
                key={item}
                onPress={() => setYear(item)}
                style={{
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: selected ? colors.accent : colors.border,
                  backgroundColor: selected ? colors.accentSoft : colors.white
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '800' }}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button title="Actualizar reporte" onPress={loadMonthly} loading={loading} />
        <Button title="Descargar / compartir PDF" onPress={downloadPdf} variant="outline" />
      </Card>

      <ListState loading={loading} empty={!loading && !monthly} />

      {monthly ? (
        <>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Card>
                <Text style={{ color: colors.muted }}>Accesos</Text>
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900' }}>
                  {entries}
                </Text>
              </Card>
            </View>

            <View style={{ flex: 1 }}>
              <Card>
                <Text style={{ color: colors.muted }}>Salidas</Text>
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900' }}>
                  {exits}
                </Text>
              </Card>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Card>
                <Text style={{ color: colors.muted }}>Flujo total</Text>
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900' }}>
                  {total}
                </Text>
              </Card>
            </View>

            <View style={{ flex: 1 }}>
              <Card>
                <Text style={{ color: colors.muted }}>Ocupación</Text>
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900' }}>
                  {occupancy.occupied}/{occupancy.total}
                </Text>
              </Card>
            </View>
          </View>

          <BarChart title="Accesos y salidas por día del mes" data={daily} />
          <BarChart title="Flujo por hora en el mes" data={hourly} labelType="hour" />
          <DonutChart entries={entries} exits={exits} total={total} />

          {weekly.length ? (
            <BarChart title="Tendencia semanal de flujo" data={weekly} />
          ) : null}

          <Card>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>
              Horas pico por día
            </Text>

            {peakByDay.slice(0, 31).map((item, index) => (
              <Text key={index} style={{ color: colors.muted, marginTop: 8 }}>
                {getItemDay(item, index)} · {getItemHour(item, index)}:00 · Flujo: {getItemTotal(item)}
              </Text>
            ))}
          </Card>

          <Card>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>
              Top días con mayor flujo del mes
            </Text>

            {topDays.slice(0, 10).map((item, index) => (
              <Text key={index} style={{ color: colors.muted, marginTop: 8 }}>
                {getItemDay(item, index)} · Flujo total: {getItemTotal(item)}
              </Text>
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
};

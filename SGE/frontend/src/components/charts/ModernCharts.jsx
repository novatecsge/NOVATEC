import React, { useMemo, useState } from 'react';

export function FlowBarChart({ data = [], xKey, bars = [], height = 280 }) {
  const [hover, setHover] = useState(null);
  const max = useMemo(() => Math.max(1, ...data.flatMap((item) => bars.map((bar) => Number(item[bar.key] || 0)))), [data, bars]);
  const width = Math.max(720, data.length * 46);
  const chartHeight = height - 70;
  const groupWidth = width / Math.max(1, data.length);
  const barWidth = Math.min(14, Math.max(7, (groupWidth - 18) / Math.max(1, bars.length)));

  return (
    <div className="chart-wrap" style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: 680 }} role="img">
        <defs>
          {bars.map((bar) => (
            <linearGradient key={bar.key} id={`grad-${bar.key}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={bar.color} stopOpacity="1" />
              <stop offset="100%" stopColor={bar.color} stopOpacity=".55" />
            </linearGradient>
          ))}
        </defs>
        {[0, .25, .5, .75, 1].map((ratio) => (
          <line key={ratio} x1="42" x2={width - 20} y1={20 + chartHeight * ratio} y2={20 + chartHeight * ratio} stroke="rgba(148,163,184,.22)" />
        ))}
        {data.map((item, index) => {
          const x = 52 + index * groupWidth;
          return (
            <g key={`${item[xKey]}-${index}`}>
              {bars.map((bar, barIndex) => {
                const value = Number(item[bar.key] || 0);
                const h = Math.max(4, (value / max) * (chartHeight - 10));
                const bx = x + barIndex * (barWidth + 4);
                return (
                  <rect
                    key={bar.key}
                    x={bx}
                    y={20 + chartHeight - h}
                    width={barWidth}
                    height={h}
                    rx="7"
                    fill={`url(#grad-${bar.key})`}
                    onMouseEnter={() => setHover({ item, value, label: bar.label })}
                    onMouseLeave={() => setHover(null)}
                    style={{ transition: 'all .2s ease', cursor: 'default' }}
                  />
                );
              })}
              <text x={x + (bars.length * (barWidth + 4)) / 2 - 3} y={height - 25} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="800">
                {item[xKey]}
              </text>
            </g>
          );
        })}
      </svg>
      {hover ? <div className="chart-tooltip" style={{ right: 12, top: 12 }}>{hover.label}: {hover.value}</div> : null}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        {bars.map((bar) => <span key={bar.key} className="legend-item"><i style={{ background: bar.color }} />{bar.label}</span>)}
      </div>
    </div>
  );
}

export function TrendLineChart({ data = [], xKey, yKey, color = '#2563eb', height = 260 }) {
  const [hover, setHover] = useState(null);
  const width = Math.max(720, data.length * 54);
  const chartHeight = height - 70;
  const max = Math.max(1, ...data.map((item) => Number(item[yKey] || 0)));
  const points = data.map((item, index) => {
    const x = 50 + (index * (width - 90)) / Math.max(1, data.length - 1);
    const y = 22 + chartHeight - (Number(item[yKey] || 0) / max) * (chartHeight - 10);
    return { x, y, item };
  });
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const areaPath = points.length ? `${path} L ${points[points.length - 1].x} ${22 + chartHeight} L ${points[0].x} ${22 + chartHeight} Z` : '';

  return (
    <div className="chart-wrap" style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: 680 }} role="img">
        <defs>
          <linearGradient id="trendArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, .25, .5, .75, 1].map((ratio) => (
          <line key={ratio} x1="42" x2={width - 20} y1={22 + chartHeight * ratio} y2={22 + chartHeight * ratio} stroke="rgba(148,163,184,.22)" />
        ))}
        <path d={areaPath} fill="url(#trendArea)" />
        <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <g key={`${point.item[xKey]}-${index}`} onMouseEnter={() => setHover(point.item)} onMouseLeave={() => setHover(null)}>
            <circle cx={point.x} cy={point.y} r="6" fill="white" stroke={color} strokeWidth="3" />
            <text x={point.x} y={height - 25} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="800">{point.item[xKey]}</text>
          </g>
        ))}
      </svg>
      {hover ? <div className="chart-tooltip" style={{ right: 12, top: 12 }}>{hover[xKey]}: {hover[yKey]}</div> : null}
    </div>
  );
}

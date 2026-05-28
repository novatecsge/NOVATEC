import React from 'react';
export default function StatCard({ title, value, hint, tone }) {
  return (
    <div className="stat-card" style={tone ? { '--role-a': tone, '--role-b': tone } : undefined}>
      <div className="stat-glow" />
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value ?? 0}</div>
      {hint ? <div className="stat-hint">{hint}</div> : null}
    </div>
  );
}

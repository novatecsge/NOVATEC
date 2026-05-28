import React from 'react';
export default function EmptyState({ title = 'Sin datos', description = 'No hay información disponible.' }) {
  return <div className="empty-state"><h3 style={{ marginTop: 0 }}>{title}</h3><p style={{ marginBottom: 0 }}>{description}</p></div>;
}

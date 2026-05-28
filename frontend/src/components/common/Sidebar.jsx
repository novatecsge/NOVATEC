import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const icons = {
  Dashboard: '◫', Usuarios: '◎', Reservas: '◴', Mapa: '▧', Reportes: '▱', Incidencias: '⚠',
  Inicio: '⌂', Vehículos: '▰', 'Mi QR': '◇', Notificaciones: '◖', Acceso: '⇄', 'Mapa operativo': '▧'
};

const sectionFor = (label) => {
  if (['Dashboard', 'Inicio', 'Usuarios'].includes(label)) return 'General';
  if (['Reservas', 'Mapa', 'Vehículos', 'Mi QR', 'Acceso', 'Mapa operativo'].includes(label)) return 'Operación';
  return 'Análisis y soporte';
};

export default function Sidebar({ items = [], role = 'user' }) {
  const [collapsed, setCollapsed] = useState(false);
  const roleLabel = role === 'admin' ? 'Enterprise admin' : role === 'guard' ? 'Operación guardia' : 'Portal usuario';
  const grouped = items.reduce((acc, item) => {
    const key = sectionFor(item.label);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-brand-row">
        <div className="sidebar-brand" title="SGE-CECyT9">
          <div className="sidebar-logo">N</div>
          <div className="sidebar-brand-text">
            <div>SGE-CECyT9</div>
            <div className="sidebar-role">{roleLabel}</div>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <div className="sidebar-system-card">
        <span>Estado del sistema</span>
        <em>Tiempo real activo</em>
      </div>

      <nav className="sidebar-nav" aria-label="Navegación principal">
        {Object.entries(grouped).map(([section, links]) => (
          <div className="sidebar-group" key={section}>
            <span className="sidebar-group-title">{section}</span>
            {links.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={item.label}>
                <span className="sidebar-icon" aria-hidden="true">{icons[item.label] || '•'}</span>
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

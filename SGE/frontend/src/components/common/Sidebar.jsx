import React from 'react';
import { NavLink } from 'react-router-dom';

const icons = {
  Dashboard: '❖', Usuarios: '❖', Reservas: '❖', Mapa: '❖', Reportes: '❖', Incidencias: '⚠',
  Inicio: '❖', Vehículos: '❖', 'Mi QR': '❖', Notificaciones: '❖', Acceso: '❖', 'Mapa operativo': '❖'
};

export default function Sidebar({ items = [], role = 'user' }) {
  const roleLabel = role === 'admin' ? 'Panel' : role === 'guard' ? 'Operación de acceso' : 'Portal usuario';
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">S</div>
        <div>
          <div>SGE-CECyT9</div>
          <div className="sidebar-role">{roleLabel}</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon">{icons[item.label] || '•'}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

import React from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const adminItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Usuarios' },
  { to: '/admin/reservations', label: 'Reservas' },
  { to: '/admin/map', label: 'Mapa' },
  { to: '/admin/reports', label: 'Reportes' },
  { to: '/admin/incidents', label: 'Incidencias' }
];

export default function AdminLayout({ title, children }) {
  return (
    <div className="app-shell admin">
      <Sidebar items={adminItems} role="admin" />
      <main className="app-main">
        <Navbar title={title} subtitle="Panel ejecutivo, métricas y operación del estacionamiento" />
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}

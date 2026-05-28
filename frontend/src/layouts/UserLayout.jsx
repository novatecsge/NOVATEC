import React from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const userItems = [
  { to: '/dashboard', label: 'Inicio' },
  { to: '/vehicles', label: 'Vehículos' },
  { to: '/reservations', label: 'Reservas' },
  { to: '/map', label: 'Mapa' },
  { to: '/qr', label: 'Mi QR' },
  { to: '/notifications', label: 'Notificaciones' },
  { to: '/incidents', label: 'Incidencias' }
];

export default function UserLayout({ title, children }) {
  return (
    <div className="app-shell user">
      <Sidebar items={userItems} role="user" />
      <main className="app-main">
        <Navbar title={title} subtitle="Consulta disponibilidad, reservas y acceso QR" />
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}

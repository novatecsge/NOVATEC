import React from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const guardItems = [
  { to: '/guard/access', label: 'Acceso' },
  { to: '/guard/map', label: 'Mapa operativo' }
];

export default function GuardLayout({ title, children }) {
  return (
    <div className="app-shell guard">
      <Sidebar items={guardItems} role="guard" />
      <main className="app-main">
        <Navbar title={title} subtitle="Accesos, salidas y monitoreo" />
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}


import React from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import SectionCard from '../../components/common/SectionCard';

const cards = [
  { to: '/vehicles', title: 'Vehículos', description: 'Consulta y administra tus vehículos.', icon: 'VE' },
  { to: '/reservations', title: 'Reservas', description: 'Solicita o revisa tus reservas.', icon: 'RS' },
  { to: '/map', title: 'Mapa', description: 'Revisa disponibilidad en tiempo real.', icon: 'MP' },
  { to: '/qr', title: 'Mi QR', description: 'Genera o consulta tu QR vigente.', icon: 'QR' },
  { to: '/notifications', title: 'Notificaciones', description: 'Avisos y alertas importantes.', icon: 'NT' },
  { to: '/incidents', title: 'Incidencias', description: 'Reporta problemas del estacionamiento.', icon: 'IN' }
];

export default function UserDashboardPage() {
  return (
    <UserLayout title="Panel de Usuario">
      <SectionCard title="Bienvenido" subtitle="Consulta disponibilidad, reservas y acceso QR desde un panel simple y ordenado.">
        <p style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>
          Sistema de Gestión de Estacionamiento del CECyT 9 “Juan de Dios Bátiz”.
        </p>
      </SectionCard>

      <div className="quick-grid">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="quick-card">
            <div className="quick-icon">{card.icon}</div>
            <div>
              <strong>{card.title}</strong>
              <span>{card.description}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard-footer">
        SISTEMA DE GESTIÓN DE ESTACIONAMIENTO DEL CENTRO DE ESTUDIOS CIENTÍFICOS Y TECNOLÓGICOS<br />
        “JUAN DE DIOS BÁTIZ” · DERECHOS RESERVADOS NOVATEC 2026
      </div>
    </UserLayout>
  );
}

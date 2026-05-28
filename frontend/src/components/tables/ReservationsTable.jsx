import React from 'react';
import EmptyState from '../common/EmptyState';

export default function ReservationsTable({ reservations = [], actions = null }) {
  if (reservations.length === 0) {
    return (
      <EmptyState
        title="Sin reservas"
        description="No hay reservas para mostrar."
      />
    );
  }

  return (
    <div className="table-shell">
      <table>
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Placa</th>
          <th>Espacio</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Estado</th>
          {actions ? <th>Acciones</th> : null}
        </tr>
      </thead>
      <tbody>
        {reservations.map((reservation) => (
          <tr key={reservation.id}>
            <td>{reservation.fullName || 'Mi reserva'}</td>
            <td>{reservation.plate}</td>
            <td>{reservation.spaceCode || '-'}</td>
            <td>{new Date(reservation.requestedStartAt).toLocaleString()}</td>
            <td>{new Date(reservation.requestedEndAt).toLocaleString()}</td>
            <td>{reservation.status}</td>
            {actions ? <td>{actions(reservation)}</td> : null}
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
}

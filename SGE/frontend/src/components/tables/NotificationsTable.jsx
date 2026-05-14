import React from 'react';
import EmptyState from '../common/EmptyState';

export default function NotificationsTable({ notifications = [], onDelete }) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        title="Sin notificaciones"
        description="No tienes notificaciones pendientes."
      />
    );
  }

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th>Título</th>
          <th>Mensaje</th>
          <th>Leída</th>
          <th>Fecha</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {notifications.map((notification) => (
          <tr key={notification.id}>
            <td>{notification.title}</td>
            <td>{notification.message}</td>
            <td>{notification.isRead ? 'Sí' : 'No'}</td>
            <td>{new Date(notification.createdAt).toLocaleString()}</td>
            <td>
              <button onClick={() => onDelete(notification.id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff'
  }
};

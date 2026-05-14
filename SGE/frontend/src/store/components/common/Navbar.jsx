import React from 'react';
import { useAuthStore } from '../../store/auth.store';

export default function Navbar({ title = 'SGE-CECyT9' }) {
  const { user, logout } = useAuthStore();

  return (
    <div style={styles.nav}>
      <div>
        <strong>{title}</strong>
      </div>
      <div style={styles.right}>
        <span>{user?.fullName}</span>
        <button onClick={logout}>Cerrar sesión</button>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #ddd',
    background: '#fff'
  },
  right: {
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  }
};

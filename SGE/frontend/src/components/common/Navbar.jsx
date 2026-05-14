
import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { authService } from '../../services/auth.service';

const formatDate = (value) => {
  if (!value) return 'No disponible';
  return new Date(value).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: '2-digit'
  });
};

export default function Navbar({ title = 'SGE-CECyT9', subtitle }) {
  const { user, logout, setUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const panelRef = useRef(null);

  const initials = (user?.fullName || 'Usuario')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    const onClick = (event) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const loadProfile = async () => {
    try {
      setProfileError('');
      const data = await authService.me();
      setProfile(data.user);
      setUser(data.user);
    } catch (err) {
      setProfileError(err?.response?.data?.message || 'No se pudo cargar el perfil');
    }
  };

  const toggleProfile = async () => {
    const next = !open;
    setOpen(next);
    setPasswordMessage('');
    if (next && !profile) await loadProfile();
  };

  const changePassword = async (event) => {
    event.preventDefault();
    try {
      setPasswordMessage('');
      await authService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setPasswordMessage('Contraseña actualizada correctamente.');
    } catch (err) {
      setPasswordMessage(err?.response?.data?.message || 'No se pudo actualizar la contraseña.');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-title">
        <strong>{title}</strong>
        <span>{subtitle || 'Sistema de Gestión de Estacionamiento en tiempo real'}</span>
      </div>
      <div className="navbar-right" ref={panelRef}>
        <button type="button" className="user-chip" onClick={toggleProfile} title="Ver perfil">
          <div className="user-avatar">{initials}</div>
          <div style={{ textAlign: 'left' }}>
            <strong>{user?.fullName || 'Usuario'}</strong>
            <div style={{ color: '#64748b', fontSize: 12, fontWeight: 700 }}>{user?.role || 'SESIÓN'}</div>
          </div>
        </button>
        <button className="logout-btn" onClick={logout}>Cerrar sesión</button>

        {open ? (
          <div className="profile-panel">
            <h3>Perfil de usuario</h3>
            {profileError ? <div className="error-alert">{profileError}</div> : null}
            <div className="profile-row"><span>Nombre</span><strong>{profile?.fullName || user?.fullName || 'Usuario'}</strong></div>
            <div className="profile-row"><span>Correo</span><strong>{profile?.email || user?.email || 'N/D'}</strong></div>
            <div className="profile-row"><span>Rol</span><strong>{profile?.role || user?.role || 'N/D'}</strong></div>
            <div className="profile-row"><span>Fecha de registro</span><strong>{formatDate(profile?.createdAt)}</strong></div>
            <div className="profile-row"><span>Vehículos registrados</span><strong>{profile?.totalVehicles ?? '0'}</strong></div>
            <form className="password-box" onSubmit={changePassword}>
              <strong>Cambiar contraseña</strong>
              <input
                type="password"
                placeholder="Contraseña actual"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                autoComplete="current-password"
              />
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                autoComplete="new-password"
                minLength={6}
              />
              <button type="submit">Actualizar contraseña</button>
              {passwordMessage ? (
                <span style={{ color: passwordMessage.includes('correctamente') ? '#166534' : '#b91c1c', fontWeight: 700, fontSize: 13 }}>
                  {passwordMessage}
                </span>
              ) : null}
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}

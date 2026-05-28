import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useNotificationStore } from '../../store/notification.store';
import { authService } from '../../services/auth.service';

const formatDate = (value) => {
  if (!value) return 'No disponible';
  return new Date(value).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: '2-digit' });
};

const formatTime = (value) => {
  if (!value) return 'Ahora';
  return new Date(value).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function Navbar({ title = 'SGE-CECyT9', subtitle }) {
  const { user, logout, setUser } = useAuthStore();
  const { notifications = [] } = useNotificationStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const navRef = useRef(null);

  const initials = (user?.fullName || 'Usuario').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const previewNotifications = useMemo(() => {
    const fallback = [
      { id: 'system-1', title: 'Sistema operativo', message: 'Monitoreo en tiempo real activo.', createdAt: new Date().toISOString(), isRead: false },
      { id: 'system-2', title: 'Panel actualizado', message: 'Indicadores y mapa sincronizados.', createdAt: new Date().toISOString(), isRead: true }
    ];
    return (notifications.length ? notifications : fallback).slice(0, 5);
  }, [notifications]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
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
    const next = !profileOpen;
    setProfileOpen(next);
    setNotificationsOpen(false);
    setPasswordMessage('');
    if (next && !profile) await loadProfile();
  };

  const toggleNotifications = () => {
    setNotificationsOpen((value) => !value);
    setProfileOpen(false);
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
    <header className="navbar" ref={navRef}>
      <div className="navbar-title">
        <span className="eyebrow">NOVATEC · SGE</span>
        <strong>{title}</strong>
        <span>{subtitle || 'Sistema de Gestión de Estacionamiento en tiempo real'}</span>
      </div>

      <div className="navbar-right">
        <button
          type="button"
          className={`nav-icon-button ${notificationsOpen ? 'is-active' : ''}`}
          title="Notificaciones"
          aria-label="Abrir notificaciones"
          aria-haspopup="dialog"
          aria-expanded={notificationsOpen}
          onClick={toggleNotifications}
        >
          <span aria-hidden="true">◖</span>
          {unreadCount ? <em>{Math.min(unreadCount, 9)}</em> : null}
        </button>

        <button type="button" className="user-chip" onClick={toggleProfile} title="Ver perfil" aria-expanded={profileOpen} aria-haspopup="dialog">
          <div className="user-avatar">{initials}</div>
          <div className="user-chip-text">
            <strong>{user?.fullName || 'Usuario'}</strong>
            <span>{user?.role || 'SESIÓN'}</span>
          </div>
          <i aria-hidden="true">⌄</i>
        </button>
        <button className="logout-btn" onClick={logout}>Cerrar sesión</button>

        {notificationsOpen ? (
          <section className="notifications-panel" role="dialog" aria-label="Panel de notificaciones">
            <div className="notifications-head">
              <div>
                <strong>Notificaciones</strong>
                <span>{unreadCount ? `${unreadCount} sin leer` : 'Todo al día'}</span>
              </div>
              <button type="button" className="panel-close" onClick={() => setNotificationsOpen(false)} aria-label="Cerrar notificaciones">×</button>
            </div>
            <div className="notifications-list">
              {previewNotifications.map((item) => (
                <article key={item.id} className={`notification-item ${item.isRead ? '' : 'is-unread'}`}>
                  <div className="notification-dot" aria-hidden="true" />
                  <div>
                    <strong>{item.title || 'Notificación'}</strong>
                    <p>{item.message || 'Actualización del sistema.'}</p>
                    <span>{formatTime(item.createdAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {profileOpen ? (
          <div className="profile-panel" role="dialog" aria-label="Perfil de usuario">
            <div className="profile-panel-head">
              <div className="user-avatar large">{initials}</div>
              <div><h3>Perfil de usuario</h3><p>Cuenta, seguridad y actividad registrada.</p></div>
            </div>
            {profileError ? <div className="error-alert">{profileError}</div> : null}
            <div className="profile-row"><span>Nombre</span><strong>{profile?.fullName || user?.fullName || 'Usuario'}</strong></div>
            <div className="profile-row"><span>Correo</span><strong>{profile?.email || user?.email || 'N/D'}</strong></div>
            <div className="profile-row"><span>Rol</span><strong>{profile?.role || user?.role || 'N/D'}</strong></div>
            <div className="profile-row"><span>Fecha de registro</span><strong>{formatDate(profile?.createdAt)}</strong></div>
            <div className="profile-row"><span>Vehículos registrados</span><strong>{profile?.totalVehicles ?? '0'}</strong></div>
            <form className="password-box" onSubmit={changePassword}>
              <strong>Cambiar contraseña</strong>
              <input type="password" placeholder="Contraseña actual" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))} autoComplete="current-password" />
              <input type="password" placeholder="Nueva contraseña" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))} autoComplete="new-password" minLength={6} />
              <button type="submit">Actualizar contraseña</button>
              {passwordMessage ? <span className={passwordMessage.includes('correctamente') ? 'form-message ok' : 'form-message bad'}>{passwordMessage}</span> : null}
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}

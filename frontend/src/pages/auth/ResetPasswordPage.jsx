import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(params.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({ token, newPassword });
      setMessage('Contraseña actualizada correctamente.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div>
          <h1 className="auth-title">Restablecer contraseña</h1>
          <p>Crea una nueva contraseña para tu cuenta.</p>
        </div>
      </section>

      <form onSubmit={submit} className="auth-card auth-form">
        <h2>Nueva contraseña</h2>

        <input
          placeholder="Token de recuperación"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        {message ? <p className="form-message ok">{message}</p> : null}
        {error ? <p className="form-message bad">{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Actualizando...' : 'Restablecer contraseña'}
        </button>

        <p className="auth-login-text">
          <Link to="/login">Volver al inicio de sesión</Link>
        </p>
      </form>
    </main>
  );
}
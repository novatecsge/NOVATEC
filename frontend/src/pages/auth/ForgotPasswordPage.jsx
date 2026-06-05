import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devUrl, setDevUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setDevUrl('');
    setLoading(true);

    try {
      const result = await authService.requestPasswordReset({ email });
      setMessage('Actualmente el servicio no está disponible, contacta con un administrador para recuperar la contraseña.');
      if (result?.resetUrl) setDevUrl(result.resetUrl);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo solicitar la recuperación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div>
          <h1 className="auth-title">Recuperar contraseña</h1>
          <p>Ingresa tu correo institucional para recibir instrucciones.</p>
        </div>
      </section>

      <form onSubmit={submit} className="auth-card auth-form">
        <h2>Recuperación</h2>

        <input
          type="email"
          placeholder="Correo institucional"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        {message ? <p className="form-message ok">{message}</p> : null}
        {devUrl ? <p className="form-message ok">URL local: {devUrl}</p> : null}
        {error ? <p className="form-message bad">{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar instrucciones'}
        </button>

        <p className="auth-login-text">
          <Link to="/login">Volver al inicio de sesión</Link>
        </p>
      </form>
    </main>
  );
}
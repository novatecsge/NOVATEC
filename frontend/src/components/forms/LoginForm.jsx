import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import logoBatiz from '../../assets/logos/logobatizneon.png';
import logoNovatec from '../../assets/logos/logonovatec2.png';

export default function LoginForm() {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const redirectByRole = (role) => {
    if (role === 'ADMIN') return navigate('/admin/dashboard');
    if (role === 'GUARD') return navigate('/guard/access');
    return navigate('/dashboard');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login(form);
      setSession(data);
      redirectByRole(data.user.role);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="auth-shell">
    <section
      className="auth-hero"
      style={{ position: 'relative' }}
    >
      {/* LOGO BATIZ */}
      <div
        style={{
          position: 'absolute',
          top: 15,
          right: 85
        }}
      >
        <img
          src={logoBatiz}
          alt="Logo Batiz"
          style={{
            height: 145,
            width: 'auto',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      </div>

      {/* LOGO NOVATEC */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          right: 70
        }}
      >
        <img
          src={logoNovatec}
          alt="Logo NOVATEC"
          style={{
            height: 120,
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
            opacity: 0.95
          }}
        />
      </div>

      <div style={{ fontWeight: 950, fontSize: 26 }}>
        SGE-CECyT9
      </div>

      <div style={{ maxWidth: 620 }}>
        <h1 className="auth-title">
          Control inteligente de estacionamiento.
        </h1>

        <p
          style={{
            color: '#cbd5e1',
            fontSize: 18,
            lineHeight: 1.6
          }}
        >
          Acceso QR, mapa en tiempo real, reservas y dashboards
          NOVATEC.
        </p>
      </div>

      <div
        style={{
          color: '#94a3b8',
          fontWeight: 800
        }}
      >
        © 2026 NOVATEC · v2.0
      </div>
    </section>

    <form onSubmit={onSubmit} className="auth-card auth-form">
      <h2>Iniciar sesión</h2>

      <p
        style={{
          margin: '0 0 8px',
          color: '#64748b',
          fontWeight: 700
        }}
      >
        Ingresa con tu cuenta institucional del IPN.
      </p>

      <input
        name="email"
        placeholder="Correo institucional | example@ipn.mx"
        value={form.email}
        onChange={onChange}
        autoComplete="username"
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={onChange}
        autoComplete="current-password"
        required
      />

      <p className="auth-login-text">
        <Link to="/forgot-password">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>

      <p className="auth-login-text">
        ¿No tienes cuenta?{' '}
        <Link to="/register">
          Registrar cuenta
        </Link>
      </p>

      {error ? (
        <div className="error-alert">
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={loading}>
        {loading ? 'Validando...' : 'Entrar al sistema'}
      </button>
    </form>
  </div>
);
}
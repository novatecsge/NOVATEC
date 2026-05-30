import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

export default function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    consentAccepted: false
  });

  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.consentAccepted) {
      setError('Debes aceptar los términos y condiciones para crear tu cuenta.');
      return;
    }

    setLoading(true);

    try {
      await authService.register(form);
      setSuccess('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div>
          <h1>NOVATEC SGE</h1>
          <p>Sistema de Gestión de Estacionamiento del CECyT 9</p>
        </div>
      </section>

      <form onSubmit={onSubmit} className="auth-card auth-form">
        <h2>Registro</h2>

        <input
          name="fullName"
          placeholder="Nombre completo"
          value={form.fullName}
          onChange={onChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Correo institucional"
          value={form.email}
          onChange={onChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={onChange}
          required
        />

        <label className="auth-consent">
          <input
            type="checkbox"
            name="consentAccepted"
            checked={form.consentAccepted}
            onChange={onChange}
          />

          <span>
            Acepto{' '}
            <button
              type="button"
              className="auth-link-button"
              onClick={() => setShowTerms(true)}
            >
              términos y condiciones
            </button>
          </span>
        </label>

        <p className="auth-login-text">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">
            Iniciar sesión
          </Link>
        </p>

        {error ? <p className="auth-error">{error}</p> : null}
        {success ? <p className="auth-success">{success}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>

      {showTerms && (
        <div className="terms-modal-overlay" onClick={() => setShowTerms(false)}>
          <section
            className="terms-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="terms-modal-header">
              <h3 id="terms-title">Términos y condiciones</h3>

              <button
                type="button"
                className="terms-modal-close"
                onClick={() => setShowTerms(false)}
              >
                ×
              </button>
            </div>

            <div className="terms-modal-content">
              <p>
                AQUÍ COLOCA TUS TÉRMINOS Y CONDICIONES DEL PROYECTO.
              </p>
            </div>

            <div className="terms-modal-actions">
              <button type="button" onClick={() => setShowTerms(false)}>
                Cerrar
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
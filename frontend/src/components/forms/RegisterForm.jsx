import React from 'react';
import { useState } from 'react';
import { authService } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    consentAccepted: true
  });
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.register(form);
      setSuccess('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo registrar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <h2>Registro</h2>

      <input
        name="fullName"
        placeholder="Nombre completo"
        value={form.fullName}
        onChange={onChange}
      />

      <input
        name="email"
        placeholder="Correo institucional"
        value={form.email}
        onChange={onChange}
      />

      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={onChange}
      />

      <label>
        <input
          type="checkbox"
          name="consentAccepted"
          checked={form.consentAccepted}
          onChange={onChange}
        />
        Acepto el tratamiento de datos
      </label>

      {error ? <p style={styles.error}>{error}</p> : null}
      {success ? <p style={styles.success}>{success}</p> : null}

      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Crear cuenta'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    width: 420,
    margin: '80px auto',
    display: 'grid',
    gap: 12,
    padding: 24,
    border: '1px solid #ddd',
    borderRadius: 12,
    background: '#fff'
  },
  error: {
    color: 'crimson',
    margin: 0
  },
  success: {
    color: 'green',
    margin: 0
  }
};

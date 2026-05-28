import React from 'react';
import { useState } from 'react';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import { useNavigate } from 'react-router-dom';

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
    <form onSubmit={onSubmit} style={styles.form}>
      <h2>Iniciar sesión</h2>

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

      {error ? <p style={styles.error}>{error}</p> : null}

      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    width: 360,
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
  }
};

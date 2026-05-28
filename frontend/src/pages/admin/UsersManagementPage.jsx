import React from 'react';
import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import SectionCard from '../../components/common/SectionCard';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import api from '../../services/api';

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (mountedRef = { current: true }) => {
    try {
      const response = await api.get('/users');
      if (mountedRef.current) setUsers(response.data.data.users);
    } catch (err) {
      if (mountedRef.current) setError(err?.response?.data?.message || 'No se pudieron cargar los usuarios');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    const mountedRef = { current: true };
    load(mountedRef);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <AdminLayout title="Gestión de Usuarios">
      <SectionCard title="Usuarios registrados">
        <ErrorAlert message={error} />
        {loading ? (
          <Loader text="Cargando usuarios..." />
        ) : users.length === 0 ? (
          <p>No hay usuarios disponibles.</p>
        ) : (
          <div className="table-shell"><table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.isActive ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </SectionCard>
    </AdminLayout>
  );
}

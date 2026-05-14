import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import Loader from '../components/common/Loader';

export default function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuthStore();

  if (isBootstrapping) {
    return <Loader text="Validando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

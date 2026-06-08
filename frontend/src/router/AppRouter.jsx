import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

import UserDashboardPage from '../pages/user/UserDashboardPage';
import VehiclesPage from '../pages/user/VehiclesPage';
import ReservationsPage from '../pages/user/ReservationsPage';
import QrPage from '../pages/user/QrPage';
import NotificationsPage from '../pages/user/NotificationsPage';
import IncidentsPage from '../pages/user/IncidentsPage';
import UserMapPage from '../pages/user/UserMapPage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UsersManagementPage from '../pages/admin/UsersManagementPage';
import ReservationsAdminPage from '../pages/admin/ReservationsAdminPage';
import ParkingMapAdminPage from '../pages/admin/ParkingMapAdminPage';
import ReportsPage from '../pages/admin/ReportsPage';
import IncidentsAdminPage from '../pages/admin/IncidentsAdminPage';
import NotificationsAdminPage from '../pages/admin/NotificationsAdminPage';

import GuardAccessPage from '../pages/guard/GuardAccessPage';
import GuardMapPage from '../pages/guard/GuardMapPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route element={<ProtectedRoute />}>

          <Route element={<RoleRoute allowedRoles={['USER']} />}>
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/qr" element={<QrPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/map" element={<UserMapPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UsersManagementPage />} />
            <Route path="/admin/reservations" element={<ReservationsAdminPage />} />
            <Route path="/admin/map" element={<ParkingMapAdminPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/incidents" element={<IncidentsAdminPage />} />
            <Route path="/admin/notifications" element={<NotificationsAdminPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={['GUARD', 'ADMIN']} />}>
            <Route path="/guard/access" element={<GuardAccessPage />} />
            <Route path="/guard/map" element={<GuardMapPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

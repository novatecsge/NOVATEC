import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import SectionCard from '../../components/common/SectionCard';

export default function NotificationsAdminPage() {
  return (
    <AdminLayout title="Notificaciones Administrativas">
      <SectionCard title="Centro de notificaciones">
        <p style={{ margin: 0 }}>
          Este espacio queda preparado para consolidar notificaciones operativas y administrativas.
        </p>
      </SectionCard>
    </AdminLayout>
  );
}

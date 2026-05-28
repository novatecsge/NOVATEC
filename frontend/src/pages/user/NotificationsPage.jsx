import React from 'react';
import { useEffect, useState } from 'react';
import UserLayout from '../../layouts/UserLayout';
import SectionCard from '../../components/common/SectionCard';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import NotificationsTable from '../../components/tables/NotificationsTable';
import { notificationsService } from '../../services/notifications.service';
import { useNotificationStore } from '../../store/notification.store';

export default function NotificationsPage() {
  const { notifications, setNotifications, removeNotification } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await notificationsService.list();
        if (mounted) setNotifications(data.notifications);
      } catch (err) {
        if (mounted) setError(err?.response?.data?.message || 'No se pudieron cargar las notificaciones');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [setNotifications]);

  const onDelete = async (id) => {
    await notificationsService.remove(id);
    removeNotification(id);
  };

  return (
    <UserLayout title="Notificaciones">
      <SectionCard title="Mis notificaciones">
        <ErrorAlert message={error} />
        {loading ? (
          <Loader text="Cargando notificaciones..." />
        ) : (
          <NotificationsTable notifications={notifications} onDelete={onDelete} />
        )}
      </SectionCard>
    </UserLayout>
  );
}

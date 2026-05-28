const { query } = require('../config/db');

const closeExpiredQrs = async () => {
  await query(`
    UPDATE vehicle_qrs
    SET
      is_active = FALSE,
      is_revoked = TRUE,
      revoked_reason = 'EXPIRED_AUTO_CLOSE',
      revoked_at = NOW(),
      updated_at = NOW()
    WHERE is_active = TRUE
      AND expires_at < NOW()
  `);
};

const notificationsRepository = require('../modules/notifications/notifications.repository');
const { emitNotificationToUser } = require('../events/notifications.events');

const sendQrExpiryReminders = async () => {
  const result = await query(`
    SELECT
      vq.id,
      vq.user_id,
      vq.vehicle_id,
      vq.expires_at,
      v.plate
    FROM vehicle_qrs vq
    INNER JOIN vehicles v ON v.id = vq.vehicle_id
    WHERE vq.is_active = TRUE
      AND vq.is_revoked = FALSE
      AND vq.expires_at > NOW()
      AND (
        vq.expires_at BETWEEN NOW() + INTERVAL '2 days' AND NOW() + INTERVAL '3 days'
        OR
        vq.expires_at BETWEEN NOW() + INTERVAL '0 days' AND NOW() + INTERVAL '1 days'
      )
  `);

  for (const qr of result.rows) {
    const expiresAt = new Date(qr.expires_at);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let title = null;
    let message = null;

    if (diffDays <= 3 && diffDays > 1) {
      title = 'Tu QR expira en 3 días';
      message = `El QR del vehículo ${qr.plate} expirará pronto. Regénéralo antes de que pierda vigencia.`;
    } else if (diffDays <= 1) {
      title = 'Tu QR expira en 1 día';
      message = `El QR del vehículo ${qr.plate} está por expirar en menos de 24 horas. Regénéralo cuanto antes.`;
    }

    if (!title) continue;

    const alreadyExists =
      await notificationsRepository.existsNotificationByUserAndEntityAndTitle({
        userId: qr.user_id,
        relatedEntityType: 'QR',
        relatedEntityId: qr.id,
        title
      });

    if (alreadyExists) continue;

    const notification = await notificationsRepository.createNotification({
      userId: qr.user_id,
      type: 'ALERT',
      channel: 'IN_APP',
      title,
      message,
      priority: 2,
      relatedEntityType: 'QR',
      relatedEntityId: qr.id
    });

    emitNotificationToUser(qr.user_id, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.created_at
    });
  }
};

const completeFinishedReservations = async () => {
  await query(`
    UPDATE reservations
    SET
      status = 'COMPLETED',
      completed_at = NOW(),
      updated_at = NOW()
    WHERE status = 'APPROVED'
      AND requested_end_at < NOW()
  `);
};

const releaseInactiveOccupiedSpaces = async () => {
  await query(`
    UPDATE parking_spaces ps
    SET
      status = 'AVAILABLE',
      updated_at = NOW()
    WHERE ps.status = 'OCCUPIED'
      AND NOT EXISTS (
        SELECT 1
        FROM access_logs al
        WHERE al.parking_space_id = ps.id
          AND al.access_type = 'ENTRY'
          AND NOT EXISTS (
            SELECT 1
            FROM access_logs ex
            WHERE ex.entry_id = al.id
              AND ex.access_type = 'EXIT'
          )
      )
  `);
};

const runMaintenanceJobs = () => {
  setInterval(async () => {
    try {
      await closeExpiredQrs();
      await completeFinishedReservations();
      await releaseInactiveOccupiedSpaces();
      await sendQrExpiryReminders();
    } catch (error) {
      console.error('Error en jobs de mantenimiento:', error);
    }
  }, 5 * 60 * 1000);
};

module.exports = {
  runMaintenanceJobs
};
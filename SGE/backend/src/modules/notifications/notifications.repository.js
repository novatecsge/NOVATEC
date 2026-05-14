const { query } = require('../../config/db');

const runner = (client) => client || { query };

const createNotification = async ({
  userId,
  type,
  channel = 'IN_APP',
  title,
  message,
  priority = 1,
  relatedEntityType = null,
  relatedEntityId = null
}, client = null) => {
  const db = runner(client);
  const sql = `
    INSERT INTO notifications (
      user_id,
      type,
      channel,
      title,
      message,
      priority,
      related_entity_type,
      related_entity_id,
      sent_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
    RETURNING *
  `;
  const result = await db.query(sql, [
    userId,
    type,
    channel,
    title,
    message,
    priority,
    relatedEntityType,
    relatedEntityId
  ]);
  return result.rows[0];
};

const listNotificationsByUser = async (userId) => {
  const sql = `
    SELECT *
    FROM notifications
    WHERE user_id = $1
      AND is_deleted = FALSE
    ORDER BY is_read ASC, priority DESC, created_at DESC
  `;
  const result = await query(sql, [userId]);
  return result.rows;
};

const markAsRead = async (notificationId, userId) => {
  const sql = `
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE id = $1
      AND user_id = $2
      AND is_deleted = FALSE
    RETURNING *
  `;
  const result = await query(sql, [notificationId, userId]);
  return result.rows[0] || null;
};

const markAllAsRead = async (userId) => {
  const sql = `
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = $1
      AND is_read = FALSE
      AND is_deleted = FALSE
  `;
  await query(sql, [userId]);
};

const deleteNotification = async (notificationId, userId) => {
  const sql = `
    UPDATE notifications
    SET
      is_deleted = TRUE,
      deleted_at = NOW()
    WHERE id = $1
      AND user_id = $2
      AND is_deleted = FALSE
    RETURNING *
  `;
  const result = await query(sql, [notificationId, userId]);
  return result.rows[0] || null;
};

const existsNotificationByUserAndEntityAndTitle = async ({
  userId,
  relatedEntityType,
  relatedEntityId,
  title
}, client = null) => {
  const db = runner(client);
  const sql = `
    SELECT 1
    FROM notifications
    WHERE user_id = $1
      AND related_entity_type = $2
      AND related_entity_id = $3
      AND title = $4
      AND is_deleted = FALSE
    LIMIT 1
  `;
  const result = await db.query(sql, [
    userId,
    relatedEntityType,
    relatedEntityId,
    title
  ]);
  return Boolean(result.rows[0]);
};

module.exports = {
  createNotification,
  listNotificationsByUser,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  existsNotificationByUserAndEntityAndTitle
};
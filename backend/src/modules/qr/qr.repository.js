const { query } = require('../../config/db');

const runner = (client) => client || { query };

const findVehicleByIdAndUser = async (vehicleId, userId, client = null) => {
  const db = runner(client);
  const sql = `
    SELECT id, user_id, plate, vehicle_type, is_active
    FROM vehicles
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    LIMIT 1
  `;
  const result = await db.query(sql, [vehicleId, userId]);
  return result.rows[0] || null;
};

const findActiveQrByVehicleId = async (vehicleId, client = null) => {
  const db = runner(client);
  const sql = `
    SELECT *
    FROM vehicle_qrs
    WHERE vehicle_id = $1
      AND is_active = TRUE
      AND is_revoked = FALSE
    ORDER BY issued_at DESC
    LIMIT 1
  `;
  const result = await db.query(sql, [vehicleId]);
  return result.rows[0] || null;
};

const createQr = async ({
  id,
  qrJti,
  vehicleId,
  userId,
  qrTokenHash,
  qrTokenValue,
  expiresAt
}, client) => {
  const sql = `
    INSERT INTO vehicle_qrs (
      id,
      vehicle_id,
      user_id,
      qr_jti,
      qr_token_hash,
      qr_token_value,
      issued_at,
      expires_at,
      is_revoked,
      is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, FALSE, TRUE)
    RETURNING *
  `;
  const result = await client.query(sql, [
    id,
    vehicleId,
    userId,
    qrJti,
    qrTokenHash,
    qrTokenValue,
    expiresAt
  ]);
  return result.rows[0];
};

const deactivateActiveQrByVehicleId = async (
  vehicleId,
  reason = 'ROTATION',
  client
) => {
  const sql = `
    UPDATE vehicle_qrs
    SET
      is_active = FALSE,
      is_revoked = TRUE,
      revoked_at = NOW(),
      revoked_reason = $2,
      updated_at = NOW()
    WHERE vehicle_id = $1
      AND is_active = TRUE
  `;
  await client.query(sql, [vehicleId, reason]);
};

const findQrById = async (qrId, client = null) => {
  const db = runner(client);
  const sql = `
    SELECT *
    FROM vehicle_qrs
    WHERE id = $1
    LIMIT 1
  `;
  const result = await db.query(sql, [qrId]);
  return result.rows[0] || null;
};

const revokeQrById = async (qrId, reason, client) => {
  const sql = `
    UPDATE vehicle_qrs
    SET
      is_active = FALSE,
      is_revoked = TRUE,
      revoked_at = NOW(),
      revoked_reason = $2,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await client.query(sql, [qrId, reason]);
  return result.rows[0] || null;
};

const createAuditLog = async ({
  actorUserId = null,
  action,
  moduleName,
  entityType,
  entityId = null,
  oldData = {},
  newData = {}
}, client = null) => {
  const db = runner(client);
  const sql = `
    INSERT INTO audit_logs (
      actor_user_id,
      action,
      module_name,
      entity_type,
      entity_id,
      old_data,
      new_data,
      details
    )
    VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, '{}'::jsonb)
  `;
  await db.query(sql, [
    actorUserId,
    action,
    moduleName,
    entityType,
    entityId,
    JSON.stringify(oldData),
    JSON.stringify(newData)
  ]);
};

module.exports = {
  findVehicleByIdAndUser,
  findActiveQrByVehicleId,
  createQr,
  deactivateActiveQrByVehicleId,
  findQrById,
  revokeQrById,
  createAuditLog
};
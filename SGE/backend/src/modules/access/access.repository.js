const { query } = require('../../config/db');

const runner = (client) => client || { query };

const findQrByIdForUpdate = async (qrId, client) => {
  const sql = `
    SELECT *
    FROM vehicle_qrs
    WHERE id = $1
    FOR UPDATE
  `;
  const result = await client.query(sql, [qrId]);
  return result.rows[0] || null;
};

const findUserByIdForAccess = async (userId, client) => {
  const sql = `
    SELECT id, is_active, is_disabled, has_disability
    FROM users
    WHERE id = $1
    LIMIT 1
  `;
  const result = await client.query(sql, [userId]);
  return result.rows[0] || null;
};

const findVehicleByIdForAccess = async (vehicleId, client) => {
  const sql = `
    SELECT id, user_id, plate, vehicle_type, is_active, deleted_at, brand, model
    FROM vehicles
    WHERE id = $1
    LIMIT 1
  `;
  const result = await client.query(sql, [vehicleId]);
  return result.rows[0] || null;
};

const findLatestOpenEntryForUpdate = async (userId, vehicleId, client) => {
  const sql = `
    SELECT entry_log.*
    FROM access_logs entry_log
    WHERE entry_log.user_id = $1
      AND entry_log.vehicle_id = $2
      AND entry_log.access_type = 'ENTRY'
      AND NOT EXISTS (
        SELECT 1
        FROM access_logs exit_log
        WHERE exit_log.entry_id = entry_log.id
          AND exit_log.access_type = 'EXIT'
      )
    ORDER BY entry_log.access_time DESC
    LIMIT 1
    FOR UPDATE
  `;
  const result = await client.query(sql, [userId, vehicleId]);
  return result.rows[0] || null;
};

const createAccessLog = async ({
  userId,
  vehicleId,
  parkingSpaceId = null,
  reservationId = null,
  qrId = null,
  entryId = null,
  accessType,
  accessTime,
  scanTokenJti = null,
  scanResult = 'ALLOWED',
  denialReason = null,
  gate = 'MAIN_GATE'
}, client) => {
  const sql = `
    INSERT INTO access_logs (
      user_id,
      vehicle_id,
      parking_space_id,
      reservation_id,
      qr_id,
      entry_id,
      access_type,
      access_time,
      scan_token_jti,
      scan_result,
      denial_reason,
      gate
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *
  `;
  const result = await client.query(sql, [
    userId,
    vehicleId,
    parkingSpaceId,
    reservationId,
    qrId,
    entryId,
    accessType,
    accessTime,
    scanTokenJti,
    scanResult,
    denialReason,
    gate
  ]);
  return result.rows[0];
};

const updateQrLastUse = async (qrId, accessType, accessTime, client) => {
  const sql = `
    UPDATE vehicle_qrs
    SET
      last_used_at = $2,
      last_entry_at = CASE WHEN $3 = 'ENTRY' THEN $2 ELSE last_entry_at END,
      last_exit_at = CASE WHEN $3 = 'EXIT' THEN $2 ELSE last_exit_at END,
      updated_at = NOW()
    WHERE id = $1
  `;
  await client.query(sql, [qrId, accessTime, accessType]);
};

const createAuditLog = async ({
  actorUserId = null,
  action,
  moduleName,
  entityType,
  entityId = null,
  oldData = {},
  newData = {}
}, client) => {
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
  await client.query(sql, [
    actorUserId,
    action,
    moduleName,
    entityType,
    entityId,
    JSON.stringify(oldData),
    JSON.stringify(newData)
  ]);
};

const existsScanTokenJti = async (scanTokenJti, client) => {
  const sql = `
    SELECT 1
    FROM access_logs
    WHERE scan_token_jti = $1
    LIMIT 1
  `;
  const result = await client.query(sql, [scanTokenJti]);
  return Boolean(result.rows[0]);
};

const findActiveApprovedReservationForVehicleAtTime = async ({
  vehicleId,
  accessTime
}, client) => {
  const sql = `
    SELECT *
    FROM reservations
    WHERE vehicle_id = $1
      AND status = 'APPROVED'
      AND requested_start_at <= $2
      AND requested_end_at >= $2
    ORDER BY requested_start_at DESC
    LIMIT 1
    FOR UPDATE
  `;
  const result = await client.query(sql, [vehicleId, accessTime]);
  return result.rows[0] || null;
};

const completeReservation = async (reservationId, client) => {
  const sql = `
    UPDATE reservations
    SET
      status = 'COMPLETED',
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await client.query(sql, [reservationId]);
  return result.rows[0] || null;
};

const updateParkingSpaceStatus = async (spaceId, status, client) => {
  const sql = `
    UPDATE parking_spaces
    SET
      status = $2,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await client.query(sql, [spaceId, status]);
  return result.rows[0] || null;
};

const findBestAvailableSpaceForVehicle = async ({
  vehicleType,
  hasDisability
}, client) => {
  const sql = `
    SELECT
      ps.*
    FROM parking_spaces ps
    WHERE ps.is_active = TRUE
      AND ps.status = 'AVAILABLE'
      AND (
        ($1 = 'MOTO' AND ps.space_type = 'MOTO')
        OR
        ($1 = 'AUTO' AND ps.space_type = 'AUTO')
        OR
        ($1 = 'AUTO' AND $2 = TRUE AND ps.space_type = 'DISABILITY')
      )
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
    ORDER BY
      CASE
        WHEN $1 = 'AUTO' AND $2 = TRUE AND ps.space_type = 'DISABILITY' THEN 0
        WHEN ps.space_type::text = $1 THEN 1
        ELSE 2
      END,
      ps.number ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  `;

  const result = await client.query(sql, [vehicleType, hasDisability]);
  return result.rows[0] || null;
};

module.exports = {
  findQrByIdForUpdate,
  findUserByIdForAccess,
  findVehicleByIdForAccess,
  findLatestOpenEntryForUpdate,
  existsScanTokenJti,
  createAccessLog,
  updateQrLastUse,
  findActiveApprovedReservationForVehicleAtTime,
  completeReservation,
  updateParkingSpaceStatus,
  findBestAvailableSpaceForVehicle,
  createAuditLog
};
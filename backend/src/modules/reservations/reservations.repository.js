const { query } = require('../../config/db');

const runner = (client) => client || { query };

const lockUserRow = async (userId, client) => {
  const sql = `
    SELECT id, has_disability, is_active, is_disabled
    FROM users
    WHERE id = $1
    FOR UPDATE
  `;
  const result = await client.query(sql, [userId]);
  return result.rows[0] || null;
};

const findVehicleByIdAndUserId = async (vehicleId, userId, client) => {
  const sql = `
    SELECT id, user_id, vehicle_type, plate, is_active, deleted_at
    FROM vehicles
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    LIMIT 1
  `;
  const result = await client.query(sql, [vehicleId, userId]);
  return result.rows[0] || null;
};

const findConflictingReservationByUser = async ({
  userId,
  requestedStartAt,
  requestedEndAt
}, client) => {
  const sql = `
    SELECT id
    FROM reservations
    WHERE user_id = $1
      AND status IN ('PENDING', 'APPROVED')
      AND NOT (
        requested_end_at <= $2
        OR requested_start_at >= $3
      )
    LIMIT 1
    FOR UPDATE
  `;
  const result = await client.query(sql, [userId, requestedStartAt, requestedEndAt]);
  return result.rows[0] || null;
};

const findAvailableSpaceForReservation = async ({
  vehicleType,
  hasDisability,
  requestedStartAt,
  requestedEndAt
}, client) => {
  const preferredType = hasDisability
    ? 'DISABILITY'
    : vehicleType === 'MOTO'
      ? 'MOTO'
      : 'AUTO';

  const sql = `
    SELECT ps.id, ps.code, ps.number, ps.space_type, ps.status
    FROM parking_spaces ps
    WHERE ps.is_active = TRUE
      AND ps.status = 'AVAILABLE'
      AND ps.space_type = $1
      AND NOT EXISTS (
        SELECT 1
        FROM reservations r
        WHERE r.parking_space_id = ps.id
          AND r.status IN ('PENDING', 'APPROVED')
          AND NOT (
            r.requested_end_at <= $2
            OR r.requested_start_at >= $3
          )
      )
    ORDER BY ps.number ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  `;
  const result = await client.query(sql, [
    preferredType,
    requestedStartAt,
    requestedEndAt
  ]);
  return result.rows[0] || null;
};

const createReservation = async ({
  userId,
  vehicleId,
  parkingSpaceId,
  requestedStartAt,
  requestedEndAt,
  status = 'PENDING'
}, client) => {
  const sql = `
    INSERT INTO reservations (
      user_id,
      vehicle_id,
      parking_space_id,
      requested_start_at,
      requested_end_at,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const result = await client.query(sql, [
    userId,
    vehicleId,
    parkingSpaceId,
    requestedStartAt,
    requestedEndAt,
    status
  ]);
  return result.rows[0];
};

const createReservationStatusHistory = async ({
  reservationId,
  oldStatus = null,
  newStatus,
  changedBy,
  changeReason = null
}, client) => {
  const sql = `
    INSERT INTO reservation_status_history (
      reservation_id,
      old_status,
      new_status,
      changed_by,
      change_reason
    )
    VALUES ($1, $2, $3, $4, $5)
  `;
  await client.query(sql, [
    reservationId,
    oldStatus,
    newStatus,
    changedBy,
    changeReason
  ]);
};

const updateParkingSpaceStatus = async (spaceId, status, client) => {
  const sql = `
    UPDATE parking_spaces
    SET status = $2, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await client.query(sql, [spaceId, status]);
  return result.rows[0] || null;
};

const listReservationsByUserId = async (userId, client = null) => {
  const db = runner(client);
  const sql = `
    SELECT
      r.*,
      ps.code AS space_code,
      ps.space_type,
      v.plate,
      v.vehicle_type
    FROM reservations r
    LEFT JOIN parking_spaces ps ON ps.id = r.parking_space_id
    INNER JOIN vehicles v ON v.id = r.vehicle_id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
  `;
  const result = await db.query(sql, [userId]);
  return result.rows;
};

const listPendingReservations = async (client = null) => {
  const db = runner(client);
  const sql = `
    SELECT
      r.*,
      u.full_name,
      u.email,
      ps.code AS space_code,
      v.plate,
      v.vehicle_type
    FROM reservations r
    INNER JOIN users u ON u.id = r.user_id
    INNER JOIN vehicles v ON v.id = r.vehicle_id
    LEFT JOIN parking_spaces ps ON ps.id = r.parking_space_id
    WHERE r.status = 'PENDING'
    ORDER BY r.created_at ASC
  `;
  const result = await db.query(sql);
  return result.rows;
};

const findReservationByIdForUpdate = async (reservationId, client) => {
  const sql = `
    SELECT *
    FROM reservations
    WHERE id = $1
    FOR UPDATE
  `;
  const result = await client.query(sql, [reservationId]);
  return result.rows[0] || null;
};

const approveReservation = async ({
  reservationId,
  approvedBy
}, client) => {
  const sql = `
    UPDATE reservations
    SET
      status = 'APPROVED',
      approved_by = $2,
      approved_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await client.query(sql, [reservationId, approvedBy]);
  return result.rows[0] || null;
};

const rejectReservation = async ({
  reservationId,
  approvedBy,
  reason
}, client) => {
  const sql = `
    UPDATE reservations
    SET
      status = 'REJECTED',
      approved_by = $2,
      approved_at = NOW(),
      rejection_reason = $3,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await client.query(sql, [reservationId, approvedBy, reason]);
  return result.rows[0] || null;
};

const cancelReservation = async (reservationId, client) => {
  const sql = `
    UPDATE reservations
    SET
      status = 'CANCELLED',
      cancelled_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await client.query(sql, [reservationId]);
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

const findOverlappingApprovedReservationForSpace = async ({
  reservationId,
  parkingSpaceId,
  requestedStartAt,
  requestedEndAt
}, client) => {
  const sql = `
    SELECT id
    FROM reservations
    WHERE parking_space_id = $2
      AND status = 'APPROVED'
      AND id <> $1
      AND NOT (
        requested_end_at <= $3
        OR requested_start_at >= $4
      )
    LIMIT 1
    FOR UPDATE
  `;
  const result = await client.query(sql, [
    reservationId,
    parkingSpaceId,
    requestedStartAt,
    requestedEndAt
  ]);
  return result.rows[0] || null;
};

module.exports = {
  lockUserRow,
  findVehicleByIdAndUserId,
  findConflictingReservationByUser,
  findAvailableSpaceForReservation,
  createReservation,
  createReservationStatusHistory,
  updateParkingSpaceStatus,
  listReservationsByUserId,
  listPendingReservations,
  findReservationByIdForUpdate,
  findOverlappingApprovedReservationForSpace,
  approveReservation,
  rejectReservation,
  cancelReservation,
  createAuditLog
};
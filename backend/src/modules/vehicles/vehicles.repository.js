const { query } = require('../../config/db');

const runner = (client) => client || { query };

const listVehiclesByUserId = async (userId, client = null) => {
  const db = runner(client);
  const sql = `
    SELECT
      id,
      user_id,
      plate,
      vehicle_type,
      brand,
      model,
      color,
      year,
      registration_status,
      is_active,
      created_at,
      updated_at
    FROM vehicles
    WHERE user_id = $1
      AND deleted_at IS NULL
    ORDER BY created_at DESC
  `;
  const result = await db.query(sql, [userId]);
  return result.rows;
};

const lockVehiclesByUserId = async (userId, client) => {
  // PostgreSQL no permite usar FOR UPDATE directamente con funciones de agregación
  // como COUNT(). Para mantener la concurrencia correcta, se bloquean las filas
  // reales del usuario y el conteo se calcula en Node.js.
  const sql = `
    SELECT id
    FROM vehicles
    WHERE user_id = $1
      AND deleted_at IS NULL
    FOR UPDATE
  `;
  const result = await client.query(sql, [userId]);
  return result.rows;
};

const findVehicleByIdAndUserId = async (vehicleId, userId, client = null) => {
  const db = runner(client);
  const sql = `
    SELECT
      id,
      user_id,
      plate,
      vehicle_type,
      brand,
      model,
      color,
      year,
      registration_status,
      is_active,
      created_at,
      updated_at
    FROM vehicles
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    LIMIT 1
  `;
  const result = await db.query(sql, [vehicleId, userId]);
  return result.rows[0] || null;
};

const findVehicleByPlate = async (plate, client = null) => {
  const db = runner(client);
  const sql = `
    SELECT id, user_id, plate
    FROM vehicles
    WHERE plate = $1
      AND deleted_at IS NULL
    LIMIT 1
  `;
  const result = await db.query(sql, [plate]);
  return result.rows[0] || null;
};

const createVehicle = async ({
  userId,
  plate,
  vehicleType,
  brand,
  model,
  color,
  year
}, client) => {
  const sql = `
    INSERT INTO vehicles (
      user_id,
      plate,
      vehicle_type,
      brand,
      model,
      color,
      year
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id,
      user_id,
      plate,
      vehicle_type,
      brand,
      model,
      color,
      year,
      registration_status,
      is_active,
      created_at,
      updated_at
  `;
  const result = await client.query(sql, [
    userId,
    plate,
    vehicleType,
    brand,
    model,
    color,
    year
  ]);
  return result.rows[0];
};

const updateVehicle = async ({
  vehicleId,
  userId,
  brand,
  model,
  color,
  year
}, client = null) => {
  const db = runner(client);
  const sql = `
    UPDATE vehicles
    SET
      brand = COALESCE($3, brand),
      model = COALESCE($4, model),
      color = COALESCE($5, color),
      year = COALESCE($6, year),
      updated_at = NOW()
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    RETURNING
      id,
      user_id,
      plate,
      vehicle_type,
      brand,
      model,
      color,
      year,
      registration_status,
      is_active,
      created_at,
      updated_at
  `;
  const result = await db.query(sql, [vehicleId, userId, brand, model, color, year]);
  return result.rows[0] || null;
};

const softDeleteVehicle = async (vehicleId, userId, client = null) => {
  const db = runner(client);
  const sql = `
    UPDATE vehicles
    SET
      is_active = FALSE,
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
      AND user_id = $2
      AND deleted_at IS NULL
    RETURNING id, plate
  `;
  const result = await db.query(sql, [vehicleId, userId]);
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

const lockUserRow = async (userId, client) => {
  const sql = `
    SELECT id
    FROM users
    WHERE id = $1
    FOR UPDATE
  `;
  const result = await client.query(sql, [userId]);
  return result.rows[0] || null;
};

module.exports = {
  listVehiclesByUserId,
  lockUserRow,
  lockVehiclesByUserId,
  findVehicleByIdAndUserId,
  findVehicleByPlate,
  createVehicle,
  updateVehicle,
  softDeleteVehicle,
  createAuditLog
};
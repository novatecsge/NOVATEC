const { query } = require('../../config/db');

const getProfileById = async (userId) => {
  const sql = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.is_active,
      u.is_disabled,
      u.has_disability,
      u.consent_accepted,
      u.created_at,
      u.updated_at,
      r.name AS role_name
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
    LIMIT 1
  `;
  const result = await query(sql, [userId]);
  return result.rows[0] || null;
};

const listUsers = async () => {
  const sql = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.is_active,
      u.is_disabled,
      u.has_disability,
      u.created_at,
      r.name AS role_name
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    ORDER BY u.created_at DESC
  `;
  const result = await query(sql);
  return result.rows;
};

const updateProfile = async ({ userId, fullName, email, hasDisability }) => {
  const sql = `
    UPDATE users
    SET
      full_name = COALESCE($2, full_name),
      email = COALESCE($3, email),
      has_disability = COALESCE($4, has_disability),
      updated_at = NOW()
    WHERE id = $1
    RETURNING id, full_name, email, is_active, is_disabled, has_disability, updated_at
  `;
  const result = await query(sql, [userId, fullName, email, hasDisability]);
  return result.rows[0] || null;
};

const updateUserStatus = async ({ userId, isActive, isDisabled }) => {
  const sql = `
    UPDATE users
    SET
      is_active = $2,
      is_disabled = $3,
      updated_at = NOW()
    WHERE id = $1
    RETURNING id, full_name, email, is_active, is_disabled, has_disability, updated_at
  `;
  const result = await query(sql, [userId, isActive, isDisabled]);
  return result.rows[0] || null;
};

const findUserByEmail = async (email) => {
  const sql = `
    SELECT id, email
    FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const result = await query(sql, [email]);
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
}) => {
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
  await query(sql, [
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
  getProfileById,
  listUsers,
  findUserByEmail,
  updateProfile,
  updateUserStatus,
  createAuditLog
};

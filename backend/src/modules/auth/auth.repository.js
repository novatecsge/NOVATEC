const { query } = require('../../config/db');

const runner = (client) => client || { query };

const findRoleByName = async (roleName, client = null) => {
  const db = runner(client);
  const sql = `
    SELECT id, name, description
    FROM roles
    WHERE name = $1
    LIMIT 1
  `;
  const result = await db.query(sql, [roleName]);
  return result.rows[0] || null;
};

const findUserByEmail = async (email, client = null) => {
  const db = runner(client);
  const sql = `
    SELECT
      u.id,
      u.role_id,
      u.full_name,
      u.email,
      u.password_hash,
      u.is_active,
      u.is_disabled,
      u.has_disability,
      u.consent_accepted,
      u.last_login_at,
      r.name AS role_name
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    WHERE u.email = $1
    LIMIT 1
  `;
  const result = await db.query(sql, [email]);
  return result.rows[0] || null;
};

const findUserById = async (userId, client = null) => {
  const db = runner(client);
  const sql = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.password_hash,
      u.is_active,
      u.is_disabled,
      u.has_disability,
      u.consent_accepted,
      u.created_at,
      u.updated_at,
      r.name AS role_name,
      COALESCE(vc.total_vehicles, 0)::int AS total_vehicles
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS total_vehicles
      FROM vehicles
      WHERE deleted_at IS NULL
      GROUP BY user_id
    ) vc ON vc.user_id = u.id
    WHERE u.id = $1
    LIMIT 1
  `;
  const result = await db.query(sql, [userId]);
  return result.rows[0] || null;
};

const createUser = async ({
  roleId,
  fullName,
  email,
  passwordHash,
  consentAccepted
}, client = null) => {
  const db = runner(client);
  const sql = `
    INSERT INTO users (
      role_id,
      full_name,
      email,
      password_hash,
      consent_accepted,
      consent_accepted_at
    )
    VALUES ($1, $2, $3, $4, $5, CASE WHEN $5 = TRUE THEN NOW() ELSE NULL END)
    RETURNING id, full_name, email, is_active, is_disabled, consent_accepted, created_at
  `;
  const result = await db.query(sql, [roleId, fullName, email, passwordHash, consentAccepted]);
  return result.rows[0];
};

const updateLastLogin = async (userId, client = null) => {
  const db = runner(client);
  const sql = `
    UPDATE users
    SET last_login_at = NOW(), updated_at = NOW()
    WHERE id = $1
  `;
  await db.query(sql, [userId]);
};

const createSession = async ({
  userId,
  refreshTokenHash,
  userAgent,
  ipAddress,
  expiresAt
}, client = null) => {
  const db = runner(client);
  const sql = `
    INSERT INTO user_sessions (
      user_id,
      refresh_token_hash,
      user_agent,
      ip_address,
      expires_at
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, expires_at, created_at
  `;
  const result = await db.query(sql, [
    userId,
    refreshTokenHash,
    userAgent,
    ipAddress,
    expiresAt
  ]);
  return result.rows[0];
};

const getActiveSessionsByUser = async (userId, client = null) => {
  const db = runner(client);
  const sql = `
    SELECT id, user_id, refresh_token_hash, expires_at, revoked_at, is_compromised
    FROM user_sessions
    WHERE user_id = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
  `;
  const result = await db.query(sql, [userId]);
  return result.rows;
};

const revokeSessionById = async (sessionId, client = null) => {
  const db = runner(client);
  const sql = `
    UPDATE user_sessions
    SET revoked_at = NOW(), updated_at = NOW()
    WHERE id = $1
  `;
  await db.query(sql, [sessionId]);
};

const markAllSessionsCompromised = async (userId, client = null) => {
  const db = runner(client);
  const sql = `
    UPDATE user_sessions
    SET is_compromised = TRUE,
        revoked_at = COALESCE(revoked_at, NOW()),
        updated_at = NOW()
    WHERE user_id = $1
  `;
  await db.query(sql, [userId]);
};

const updatePassword = async (userId, passwordHash, client = null) => {
  const db = runner(client);
  const sql = `
    UPDATE users
    SET password_hash = $2, updated_at = NOW()
    WHERE id = $1
  `;
  await db.query(sql, [userId, passwordHash]);
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
  findRoleByName,
  findUserByEmail,
  findUserById,
  updatePassword,
  createUser,
  updateLastLogin,
  createSession,
  getActiveSessionsByUser,
  revokeSessionById,
  markAllSessionsCompromised,
  createAuditLog
};
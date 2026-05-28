const { query } = require('../../config/db');

const runner = (client) => client || { query };

const createIncident = async ({
  userId,
  incidentType,
  description
}, client = null) => {
  const db = runner(client);
  const sql = `
    INSERT INTO incidents (
      user_id,
      incident_type,
      description,
      status
    )
    VALUES ($1, $2, $3, 'OPEN'::incident_status_enum)
    RETURNING *
  `;
  const result = await db.query(sql, [userId, incidentType, description]);
  return result.rows[0];
};

const listIncidents = async () => {
  const sql = `
    SELECT i.*, u.full_name, u.email
    FROM incidents i
    INNER JOIN users u ON u.id = i.user_id
    ORDER BY i.created_at DESC
  `;
  const result = await query(sql);
  return result.rows;
};

const updateIncidentStatus = async ({
  incidentId,
  status,
  resolvedBy
}, client = null) => {
  const db = runner(client);
  const sql = `
    UPDATE incidents
    SET
      status = $2::incident_status_enum,
      resolved_by = CASE
        WHEN $2::incident_status_enum IN ('RESOLVED'::incident_status_enum, 'CLOSED'::incident_status_enum)
          THEN $3
        ELSE resolved_by
      END,
      resolved_at = CASE
        WHEN $2::incident_status_enum IN ('RESOLVED'::incident_status_enum, 'CLOSED'::incident_status_enum)
          THEN NOW()
        ELSE resolved_at
      END,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await db.query(sql, [incidentId, status, resolvedBy]);
  return result.rows[0] || null;
};

const findIncidentById = async (incidentId) => {
  const sql = `
    SELECT *
    FROM incidents
    WHERE id = $1
    LIMIT 1
  `;
  const result = await query(sql, [incidentId]);
  return result.rows[0] || null;
};

module.exports = {
  createIncident,
  listIncidents,
  updateIncidentStatus,
  findIncidentById
};
const { query } = require('../../config/db');

const getSummary = async () => {
  const sql = `
    WITH open_entries AS (
      SELECT DISTINCT al.parking_space_id
      FROM access_logs al
      WHERE al.parking_space_id IS NOT NULL
        AND al.access_type = 'ENTRY'
        AND NOT EXISTS (
          SELECT 1 FROM access_logs ex
          WHERE ex.entry_id = al.id AND ex.access_type = 'EXIT'
        )
    )
    SELECT
      (SELECT COUNT(*) FROM users WHERE is_active = TRUE AND is_disabled = FALSE) AS active_users,
      (SELECT COUNT(*) FROM vehicles WHERE deleted_at IS NULL AND is_active = TRUE) AS active_vehicles,
      (SELECT COUNT(*) FROM parking_spaces WHERE is_active = TRUE) - (SELECT COUNT(*) FROM open_entries) AS available_spaces,
      (SELECT COUNT(*) FROM open_entries) AS occupied_spaces,
      (SELECT COUNT(*) FROM parking_spaces WHERE is_active = TRUE) AS total_spaces,
      (SELECT COUNT(*) FROM reservations WHERE status = 'PENDING') AS pending_reservations,
      (SELECT COUNT(*) FROM incidents WHERE status IN ('OPEN','IN_REVIEW')) AS open_incidents
  `;
  const result = await query(sql);
  return result.rows[0];
};

const getTodayAccessMetrics = async () => {
  const sql = `
    SELECT
      COUNT(*) FILTER (WHERE access_type = 'ENTRY') AS entries_today,
      COUNT(*) FILTER (WHERE access_type = 'EXIT') AS exits_today
    FROM access_logs
    WHERE access_time::date = CURRENT_DATE
  `;
  const result = await query(sql);
  return result.rows[0];
};

const getPeakHours = async () => {
  const sql = `
    SELECT
      EXTRACT(HOUR FROM access_time)::int AS hour,
      COUNT(*) FILTER (WHERE access_type = 'ENTRY')::int AS total_entries
    FROM access_logs
    WHERE access_type = 'ENTRY'
      AND access_time >= NOW() - INTERVAL '30 days'
    GROUP BY EXTRACT(HOUR FROM access_time)
    ORDER BY total_entries DESC, hour ASC
    LIMIT 10
  `;
  const result = await query(sql);
  return result.rows;
};

const getUsageByUser = async () => {
  const sql = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      COUNT(al.id) FILTER (WHERE al.access_type = 'ENTRY')::int AS total_entries
    FROM users u
    LEFT JOIN access_logs al ON al.user_id = u.id
    GROUP BY u.id, u.full_name, u.email
    ORDER BY total_entries DESC, u.full_name ASC
    LIMIT 10
  `;
  const result = await query(sql);
  return result.rows;
};

const getHourlyFlow = async () => {
  const sql = `
    WITH hours AS (
      SELECT generate_series(0, 23) AS hour
    )
    SELECT
      hours.hour,
      COALESCE(COUNT(al.id) FILTER (WHERE al.access_type = 'ENTRY'), 0)::int AS entries,
      COALESCE(COUNT(al.id) FILTER (WHERE al.access_type = 'EXIT'), 0)::int AS exits,
      COALESCE(COUNT(al.id), 0)::int AS total_flow
    FROM hours
    LEFT JOIN access_logs al
      ON EXTRACT(HOUR FROM al.access_time)::int = hours.hour
      AND al.access_time >= NOW() - INTERVAL '30 days'
    GROUP BY hours.hour
    ORDER BY hours.hour ASC
  `;
  const result = await query(sql);
  return result.rows;
};

const getDailyFlow = async () => {
  const sql = `
    SELECT
      TO_CHAR(DATE(access_time), 'YYYY-MM-DD') AS day,
      COUNT(*) FILTER (WHERE access_type = 'ENTRY')::int AS entries,
      COUNT(*) FILTER (WHERE access_type = 'EXIT')::int AS exits,
      COUNT(*)::int AS total_flow
    FROM access_logs
    WHERE access_time >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(access_time)
    ORDER BY DATE(access_time) ASC
  `;
  const result = await query(sql);
  return result.rows;
};

const getTopFlowDays = async () => {
  const sql = `
    SELECT
      TO_CHAR(DATE(access_time), 'YYYY-MM-DD') AS day,
      COUNT(*)::int AS total_flow
    FROM access_logs
    WHERE access_time >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(access_time)
    ORDER BY total_flow DESC, DATE(access_time) DESC
    LIMIT 10
  `;
  const result = await query(sql);
  return result.rows;
};

module.exports = {
  getSummary,
  getTodayAccessMetrics,
  getPeakHours,
  getUsageByUser,
  getHourlyFlow,
  getDailyFlow,
  getTopFlowDays
};

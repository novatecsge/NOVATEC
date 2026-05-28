
const { query } = require('../../config/db');

const getAccessHistoryReport = async () => {
  const sql = `
    SELECT
      al.id,
      al.access_type,
      al.access_time,
      al.gate,
      u.full_name,
      u.email,
      v.plate,
      ps.code AS space_code
    FROM access_logs al
    INNER JOIN users u ON u.id = al.user_id
    INNER JOIN vehicles v ON v.id = al.vehicle_id
    LEFT JOIN parking_spaces ps ON ps.id = al.parking_space_id
    ORDER BY al.access_time DESC
    LIMIT 500
  `;
  const result = await query(sql);
  return result.rows;
};

const getSpaceUsageReport = async () => {
  const sql = `
    SELECT
      ps.id,
      ps.code,
      ps.number,
      ps.space_type,
      COUNT(al.id) FILTER (WHERE al.access_type = 'ENTRY') AS total_entries
    FROM parking_spaces ps
    LEFT JOIN access_logs al ON al.parking_space_id = ps.id
    WHERE ps.is_active = TRUE
    GROUP BY ps.id, ps.code, ps.number, ps.space_type
    ORDER BY total_entries DESC, ps.number ASC
  `;
  const result = await query(sql);
  return result.rows;
};

const getUserReservationReport = async () => {
  const sql = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      COUNT(r.id) AS total_reservations,
      COUNT(r.id) FILTER (WHERE r.status = 'APPROVED') AS approved_reservations,
      COUNT(r.id) FILTER (WHERE r.status = 'REJECTED') AS rejected_reservations,
      COUNT(r.id) FILTER (WHERE r.status = 'COMPLETED') AS completed_reservations
    FROM users u
    LEFT JOIN reservations r ON r.user_id = u.id
    GROUP BY u.id, u.full_name, u.email
    ORDER BY total_reservations DESC, u.full_name ASC
  `;
  const result = await query(sql);
  return result.rows;
};

const getMonthlyReport = async ({ year, month }) => {
  const params = [year, month];
  const totals = await query(`
    SELECT
      COUNT(*) FILTER (WHERE access_type = 'ENTRY')::int AS total_entries,
      COUNT(*) FILTER (WHERE access_type = 'EXIT')::int AS total_exits,
      COUNT(*)::int AS total_flow
    FROM access_logs
    WHERE EXTRACT(YEAR FROM access_time)::int = $1
      AND EXTRACT(MONTH FROM access_time)::int = $2
  `, params);

  const daily = await query(`
    WITH days AS (
      SELECT generate_series(
        make_date($1, $2, 1),
        (make_date($1, $2, 1) + INTERVAL '1 month - 1 day')::date,
        INTERVAL '1 day'
      )::date AS day
    )
    SELECT
      TO_CHAR(days.day, 'YYYY-MM-DD') AS day,
      COALESCE(COUNT(al.id) FILTER (WHERE al.access_type = 'ENTRY'), 0)::int AS entries,
      COALESCE(COUNT(al.id) FILTER (WHERE al.access_type = 'EXIT'), 0)::int AS exits,
      COALESCE(COUNT(al.id), 0)::int AS total_flow
    FROM days
    LEFT JOIN access_logs al ON al.access_time::date = days.day
    GROUP BY days.day
    ORDER BY days.day ASC
  `, params);

  const hourly = await query(`
    WITH hours AS (SELECT generate_series(0, 23) AS hour)
    SELECT
      hours.hour,
      COALESCE(COUNT(al.id) FILTER (WHERE al.access_type = 'ENTRY'), 0)::int AS entries,
      COALESCE(COUNT(al.id) FILTER (WHERE al.access_type = 'EXIT'), 0)::int AS exits,
      COALESCE(COUNT(al.id), 0)::int AS total_flow
    FROM hours
    LEFT JOIN access_logs al
      ON EXTRACT(HOUR FROM al.access_time)::int = hours.hour
      AND EXTRACT(YEAR FROM al.access_time)::int = $1
      AND EXTRACT(MONTH FROM al.access_time)::int = $2
    GROUP BY hours.hour
    ORDER BY hours.hour ASC
  `, params);

  const peakByDay = await query(`
    SELECT DISTINCT ON (DATE(access_time))
      TO_CHAR(DATE(access_time), 'YYYY-MM-DD') AS day,
      EXTRACT(HOUR FROM access_time)::int AS hour,
      COUNT(*)::int AS total_flow
    FROM access_logs
    WHERE EXTRACT(YEAR FROM access_time)::int = $1
      AND EXTRACT(MONTH FROM access_time)::int = $2
    GROUP BY DATE(access_time), EXTRACT(HOUR FROM access_time)
    ORDER BY DATE(access_time), COUNT(*) DESC
  `, params);

  const topDays = await query(`
    SELECT
      TO_CHAR(DATE(access_time), 'YYYY-MM-DD') AS day,
      COUNT(*)::int AS total_flow
    FROM access_logs
    WHERE EXTRACT(YEAR FROM access_time)::int = $1
      AND EXTRACT(MONTH FROM access_time)::int = $2
    GROUP BY DATE(access_time)
    ORDER BY total_flow DESC, DATE(access_time) ASC
    LIMIT 10
  `, params);

  const occupancy = await query(`
    SELECT
      (SELECT COUNT(*) FROM parking_spaces WHERE is_active = TRUE)::int AS total_spaces,
      (SELECT COUNT(*) FROM parking_spaces WHERE is_active = TRUE AND status = 'OCCUPIED')::int AS occupied_now,
      (SELECT COUNT(*) FROM parking_spaces WHERE is_active = TRUE AND status = 'AVAILABLE')::int AS available_now
  `);

  return {
    year,
    month,
    totals: totals.rows[0],
    daily: daily.rows,
    hourly: hourly.rows,
    peakByDay: peakByDay.rows,
    topDays: topDays.rows,
    occupancy: occupancy.rows[0]
  };
};

module.exports = {
  getAccessHistoryReport,
  getSpaceUsageReport,
  getUserReservationReport,
  getMonthlyReport
};

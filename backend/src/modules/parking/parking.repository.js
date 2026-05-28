const { query } = require('../../config/db');

const getParkingMap = async () => {
  const sql = `
    SELECT
      ps.id,
      ps.code,
      ps.number,
      ps.space_type,
      CASE
        WHEN occ.access_log_id IS NOT NULL THEN 'OCCUPIED'
        WHEN res.reservation_id IS NOT NULL THEN 'RESERVED'
        WHEN ps.status::text = 'BLOCKED' THEN 'OUT_OF_SERVICE'
        ELSE ps.status::text
      END AS effective_status,
      COALESCE(occ.reservation_id, res.reservation_id) AS reservation_id,
      occ.user_id,
      occ.vehicle_id,
      occ.access_log_id,
      v.plate,
      v.brand,
      v.model,
      CASE
        WHEN occ.access_log_id IS NOT NULL THEN 'ASSIGNED'
        WHEN res.reservation_id IS NOT NULL THEN 'RESERVED'
        ELSE 'UNASSIGNED'
      END AS assignment_status
    FROM parking_spaces ps
    LEFT JOIN LATERAL (
      SELECT
        al.id AS access_log_id,
        al.user_id,
        al.vehicle_id,
        al.reservation_id,
        al.parking_space_id
      FROM access_logs al
      WHERE al.parking_space_id = ps.id
        AND al.access_type = 'ENTRY'
        AND NOT EXISTS (
          SELECT 1
          FROM access_logs ex
          WHERE ex.entry_id = al.id
            AND ex.access_type = 'EXIT'
        )
      ORDER BY al.access_time DESC
      LIMIT 1
    ) occ ON TRUE
    LEFT JOIN LATERAL (
      SELECT r.id AS reservation_id
      FROM reservations r
      WHERE r.parking_space_id = ps.id
        AND r.status = 'APPROVED'
        AND r.requested_start_at <= NOW()
        AND r.requested_end_at >= NOW()
      ORDER BY r.requested_start_at ASC
      LIMIT 1
    ) res ON TRUE
    LEFT JOIN vehicles v ON v.id = occ.vehicle_id
    WHERE ps.is_active = TRUE
    ORDER BY ps.number ASC
  `;

  const result = await query(sql);
  return result.rows;
};

module.exports = {
  getParkingMap
};

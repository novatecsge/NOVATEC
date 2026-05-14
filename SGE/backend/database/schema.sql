BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_name_enum') THEN
        CREATE TYPE role_name_enum AS ENUM ('ADMIN', 'GUARD', 'USER');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type_enum') THEN
        CREATE TYPE vehicle_type_enum AS ENUM ('AUTO', 'MOTO');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'space_type_enum') THEN
        CREATE TYPE space_type_enum AS ENUM ('AUTO', 'MOTO', 'DISABILITY');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'space_status_enum') THEN
        CREATE TYPE space_status_enum AS ENUM ('AVAILABLE', 'OCCUPIED', 'BLOCKED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status_enum') THEN
        CREATE TYPE reservation_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_type_enum') THEN
        CREATE TYPE access_type_enum AS ENUM ('ENTRY', 'EXIT');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_status_enum') THEN
        CREATE TYPE incident_status_enum AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
        CREATE TYPE notification_type_enum AS ENUM ('SYSTEM', 'RESERVATION', 'ACCESS', 'INCIDENT', 'ALERT');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel_enum') THEN
        CREATE TYPE notification_channel_enum AS ENUM ('IN_APP', 'EMAIL');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name role_name_enum NOT NULL UNIQUE,
    description VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_disabled BOOLEAN NOT NULL DEFAULT FALSE,
    has_disability BOOLEAN NOT NULL DEFAULT FALSE,
    consent_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    consent_accepted_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_users_email_ipn CHECK (email ~* '^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)*ipn\.mx$')
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    user_agent TEXT NULL,
    ip_address INET NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    is_compromised BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plate VARCHAR(15) NOT NULL,
    vehicle_type vehicle_type_enum NOT NULL,
    brand VARCHAR(60) NOT NULL,
    model VARCHAR(60) NOT NULL,
    color VARCHAR(40) NOT NULL,
    year INT NOT NULL,
    registration_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_vehicle_year CHECK (year BETWEEN 1980 AND EXTRACT(YEAR FROM NOW())::INT + 1)
);

CREATE TABLE IF NOT EXISTS vehicle_qrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    qr_jti UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    qr_token_hash TEXT NOT NULL,
    qr_token_value TEXT NULL,
    issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP NULL,
    last_entry_at TIMESTAMP NULL,
    last_exit_at TIMESTAMP NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    revoked_at TIMESTAMP NULL,
    revoked_reason TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_qr_expiration CHECK (expires_at > issued_at)
);

CREATE TABLE IF NOT EXISTS parking_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE,
    number INT NOT NULL UNIQUE,
    space_type space_type_enum NOT NULL,
    status space_status_enum NOT NULL DEFAULT 'AVAILABLE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    parking_space_id UUID NULL REFERENCES parking_spaces(id) ON DELETE SET NULL,
    requested_start_at TIMESTAMP NOT NULL,
    requested_end_at TIMESTAMP NOT NULL,
    status reservation_status_enum NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT NULL,
    approved_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_reservation_dates CHECK (requested_end_at > requested_start_at)
);

CREATE TABLE IF NOT EXISTS reservation_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    old_status reservation_status_enum NULL,
    new_status reservation_status_enum NOT NULL,
    changed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    change_reason TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    parking_space_id UUID NULL REFERENCES parking_spaces(id) ON DELETE SET NULL,
    reservation_id UUID NULL REFERENCES reservations(id) ON DELETE SET NULL,
    qr_id UUID NULL REFERENCES vehicle_qrs(id) ON DELETE SET NULL,
    entry_id UUID NULL REFERENCES access_logs(id) ON DELETE SET NULL,
    access_type access_type_enum NOT NULL,
    access_time TIMESTAMP NOT NULL DEFAULT NOW(),
    scan_token_jti UUID NULL,
    scan_result VARCHAR(20) NOT NULL DEFAULT 'ALLOWED',
    denial_reason TEXT NULL,
    gate VARCHAR(40) NULL DEFAULT 'MAIN_GATE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    incident_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status incident_status_enum NOT NULL DEFAULT 'OPEN',
    resolved_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    channel notification_channel_enum NOT NULL DEFAULT 'IN_APP',
    title VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    priority SMALLINT NOT NULL DEFAULT 1,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    related_entity_type VARCHAR(50) NULL,
    related_entity_id UUID NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id UUID NULL,
    old_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    new_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_roles_updated_at ON roles;
CREATE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER trg_user_sessions_updated_at
BEFORE UPDATE ON user_sessions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON vehicles;
CREATE TRIGGER trg_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_vehicle_qrs_updated_at ON vehicle_qrs;
CREATE TRIGGER trg_vehicle_qrs_updated_at
BEFORE UPDATE ON vehicle_qrs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_parking_spaces_updated_at ON parking_spaces;
CREATE TRIGGER trg_parking_spaces_updated_at
BEFORE UPDATE ON parking_spaces
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_reservations_updated_at ON reservations;
CREATE TRIGGER trg_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_incidents_updated_at ON incidents;
CREATE TRIGGER trg_incidents_updated_at
BEFORE UPDATE ON incidents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION enforce_max_three_vehicles()
RETURNS TRIGGER AS $$
DECLARE
    vehicle_count INT;
BEGIN
    SELECT COUNT(*) INTO vehicle_count
    FROM vehicles
    WHERE user_id = NEW.user_id
      AND deleted_at IS NULL;

    IF vehicle_count >= 3 THEN
        RAISE EXCEPTION 'El usuario ya tiene el máximo de 3 vehículos registrados';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_max_three_vehicles ON vehicles;
CREATE TRIGGER trg_enforce_max_three_vehicles
BEFORE INSERT ON vehicles
FOR EACH ROW EXECUTE FUNCTION enforce_max_three_vehicles();

CREATE OR REPLACE FUNCTION validate_vehicle_owner_matches_qr()
RETURNS TRIGGER AS $$
DECLARE
    owner_id UUID;
BEGIN
    SELECT user_id INTO owner_id
    FROM vehicles
    WHERE id = NEW.vehicle_id;

    IF owner_id IS NULL OR owner_id <> NEW.user_id THEN
        RAISE EXCEPTION 'El QR no coincide con el propietario del vehículo';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_vehicle_owner_matches_qr ON vehicle_qrs;
CREATE TRIGGER trg_validate_vehicle_owner_matches_qr
BEFORE INSERT OR UPDATE ON vehicle_qrs
FOR EACH ROW EXECUTE FUNCTION validate_vehicle_owner_matches_qr();

CREATE OR REPLACE FUNCTION validate_vehicle_owner_matches_reservation()
RETURNS TRIGGER AS $$
DECLARE
    owner_id UUID;
BEGIN
    SELECT user_id INTO owner_id
    FROM vehicles
    WHERE id = NEW.vehicle_id;

    IF owner_id IS NULL OR owner_id <> NEW.user_id THEN
        RAISE EXCEPTION 'El vehículo no pertenece al usuario de la reserva';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_vehicle_owner_matches_reservation ON reservations;
CREATE TRIGGER trg_validate_vehicle_owner_matches_reservation
BEFORE INSERT OR UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION validate_vehicle_owner_matches_reservation();

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_type ON vehicles(vehicle_type);
CREATE UNIQUE INDEX IF NOT EXISTS uq_plate_active
ON vehicles(plate)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON user_sessions(refresh_token_hash);

CREATE INDEX IF NOT EXISTS idx_qr_vehicle_id ON vehicle_qrs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_qr_user_id ON vehicle_qrs(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_revoked_expires ON vehicle_qrs(is_revoked, expires_at);
CREATE INDEX IF NOT EXISTS idx_qr_last_used_at ON vehicle_qrs(last_used_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_vehicle_active_qr
ON vehicle_qrs(vehicle_id)
WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_spaces_type_status ON parking_spaces(space_type, status);
CREATE INDEX IF NOT EXISTS idx_spaces_status ON parking_spaces(status);

CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle_id ON reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reservations_space_id ON reservations(parking_space_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_range ON reservations(requested_start_at, requested_end_at);
CREATE INDEX IF NOT EXISTS idx_reservations_status_range ON reservations(status, requested_start_at, requested_end_at);
CREATE INDEX IF NOT EXISTS idx_reservations_conflict
ON reservations (parking_space_id, requested_start_at, requested_end_at)
WHERE status IN ('PENDING', 'APPROVED');
CREATE INDEX IF NOT EXISTS idx_reservations_time_range
ON reservations (parking_space_id, requested_start_at, requested_end_at)
WHERE status IN ('PENDING', 'APPROVED');
CREATE INDEX IF NOT EXISTS idx_reservations_user_time_range
ON reservations (user_id, requested_start_at, requested_end_at)
WHERE status IN ('PENDING', 'APPROVED');

CREATE INDEX IF NOT EXISTS idx_access_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_vehicle_id ON access_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_access_space_id ON access_logs(parking_space_id);
CREATE INDEX IF NOT EXISTS idx_access_qr_id ON access_logs(qr_id);
CREATE INDEX IF NOT EXISTS idx_access_type_time ON access_logs(access_type, access_time);
CREATE INDEX IF NOT EXISTS idx_access_user_time ON access_logs(user_id, access_time DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_vehicle_entry
ON access_logs(user_id, vehicle_id, access_type);
CREATE UNIQUE INDEX IF NOT EXISTS uq_access_logs_scan_token_jti
ON access_logs(scan_token_jti)
WHERE scan_token_jti IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_status_created ON incidents(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_module_time ON audit_logs(module_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON audit_logs(actor_user_id, created_at DESC);

INSERT INTO roles (name, description)
VALUES
('ADMIN', 'Administrador del sistema'),
('GUARD', 'Guardia de acceso'),
('USER', 'Usuario general')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (
    role_id,
    full_name,
    email,
    password_hash,
    is_active,
    is_disabled,
    has_disability,
    consent_accepted,
    consent_accepted_at
)
SELECT
    r.id,
    'Administrador Inicial',
    'admin@ipn.mx',
    '$2b$12$6r2u0m5k8vMZk0s2nQ2mWe0nQeWz7m8L9J6S4G9VYtT4Ih4I4tYxK',
    TRUE,
    FALSE,
    FALSE,
    TRUE,
    NOW()
FROM roles r
WHERE r.name = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM users WHERE email = 'admin@ipn.mx'
  );

INSERT INTO parking_spaces (code, number, space_type, status, is_active, notes)
SELECT
    'A' || gs::TEXT,
    gs,
    'AUTO'::space_type_enum,
    'AVAILABLE'::space_status_enum,
    TRUE,
    'Espacio auto'
FROM generate_series(1, 65) AS gs
ON CONFLICT (number) DO NOTHING;

INSERT INTO parking_spaces (code, number, space_type, status, is_active, notes)
SELECT
    'M' || gs::TEXT,
    65 + gs,
    'MOTO'::space_type_enum,
    'AVAILABLE'::space_status_enum,
    TRUE,
    'Espacio moto'
FROM generate_series(1, 4) AS gs
ON CONFLICT (number) DO NOTHING;

INSERT INTO parking_spaces (code, number, space_type, status, is_active, notes)
VALUES
('D1', 70, 'DISABILITY', 'AVAILABLE', TRUE, 'Espacio reservado para discapacidad')
ON CONFLICT (number) DO NOTHING;


-- Layout oficial del estacionamiento SGE-CECyT9 (73 espacios)
UPDATE parking_spaces SET number = number + 10000 WHERE number < 10000;

INSERT INTO parking_spaces (code, number, space_type, status, is_active, notes)
VALUES
('A1', 1, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('A2', 2, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('A3', 3, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('A4', 4, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('A5', 5, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('A6', 6, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('A7', 7, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('A8', 8, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('A9', 9, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('A10', 10, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('A11', 11, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('A12', 12, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B1', 13, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B2', 14, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B3', 15, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B4', 16, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B5', 17, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B6', 18, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B7', 19, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B8', 20, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B9', 21, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B10', 22, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B11', 23, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B12', 24, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('B13', 25, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('C1', 26, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('C2', 27, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('C3', 28, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('C4', 29, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D1', 30, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D2', 31, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D3', 32, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D4', 33, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D5', 34, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D6', 35, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D7', 36, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D8', 37, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D9', 38, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D10', 39, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D11', 40, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D12', 41, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D13', 42, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D14', 43, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('D15', 44, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('E1', 45, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('E2', 46, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('E3', 47, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('E4', 48, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('E5', 49, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('E6', 50, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('E7', 51, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('E8', 52, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('E9', 53, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('E10', 54, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('E11', 55, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('E12', 56, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('F1', 57, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('F2', 58, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('F3', 59, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('F4', 60, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('F5', 61, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('F6', 62, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('F7', 63, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('F8', 64, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('F9', 65, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('F10', 66, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('F11', 67, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('F12', 68, 'AUTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('M1', 69, 'MOTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('M2', 70, 'MOTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('M3', 71, 'MOTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('M4', 72, 'MOTO'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9'),
('DIS1', 73, 'DISABILITY'::space_type_enum, 'AVAILABLE'::space_status_enum, TRUE, 'Layout oficial SGE-CECyT9')
ON CONFLICT (code) DO UPDATE SET
  number = EXCLUDED.number,
  space_type = EXCLUDED.space_type,
  is_active = TRUE,
  updated_at = NOW();

UPDATE parking_spaces
SET is_active = FALSE, updated_at = NOW()
WHERE code NOT IN ('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'M1', 'M2', 'M3', 'M4', 'DIS1');

INSERT INTO system_settings (key, value)
VALUES
('ANTI_REPLAY_SECONDS', '15'),
('MAX_VEHICLES_PER_USER', '3'),
('QR_EXPIRATION_HOURS', '24')
ON CONFLICT (key) DO NOTHING;

COMMIT;
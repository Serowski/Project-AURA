-- ============================================================
-- Project AURA — PostgreSQL Schema
-- Stores all 3 data layers: raw, Kalman-filtered, AI risk
-- ============================================================

CREATE TABLE IF NOT EXISTS sensor_readings (
    id              BIGSERIAL       PRIMARY KEY,
    device          VARCHAR(64)     NOT NULL,
    timestamp       TIMESTAMPTZ     NOT NULL,
    node            VARCHAR(64),

    -- Layer 1: RAW sensor data
    raw_temp        DOUBLE PRECISION,
    raw_humidity    DOUBLE PRECISION,
    raw_light       DOUBLE PRECISION,
    raw_dist        DOUBLE PRECISION,

    -- Layer 2: Kalman-filtered data
    flt_temp        DOUBLE PRECISION,
    flt_humidity    DOUBLE PRECISION,
    flt_light       DOUBLE PRECISION,
    flt_dist        DOUBLE PRECISION,

    -- Layer 3: AI risk estimation
    risk_eval       VARCHAR(16),            -- "OK" / "WARN" / "CRIT"
    risk_score      DOUBLE PRECISION,       -- 0.0-100.0 (from edge AI)

    -- Metadata
    raw_payload     JSONB,
    created_at      TIMESTAMPTZ     DEFAULT NOW()
);

-- Indexes for time-series queries
CREATE INDEX IF NOT EXISTS idx_readings_device_ts
    ON sensor_readings (device, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_readings_ts
    ON sensor_readings (timestamp DESC);

-- ============================================================
-- Alarms table
-- ============================================================

CREATE TABLE IF NOT EXISTS alarms (
    id              BIGSERIAL       PRIMARY KEY,
    device          VARCHAR(64),
    alarm_type      VARCHAR(64)     NOT NULL,
    message         TEXT,
    severity        VARCHAR(16)     DEFAULT 'WARN',
    acknowledged    BOOLEAN         DEFAULT FALSE,
    created_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alarms_created
    ON alarms (created_at DESC);

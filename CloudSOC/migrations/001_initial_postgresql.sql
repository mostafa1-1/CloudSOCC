-- CloudSOC Normalized PostgreSQL Schema (Migration 001)
-- Aligns 1:1 with SQLAlchemy models in app/models/models.py

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    event_uid VARCHAR(32) NOT NULL UNIQUE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_ip VARCHAR(64) NOT NULL,
    username VARCHAR(64) NOT NULL,
    event_type VARCHAR(48) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    user_agent VARCHAR(255) NOT NULL DEFAULT '',
    detection_status VARCHAR(32) NOT NULL DEFAULT 'Processed',
    rule_triggered VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS detection_rules (
    id SERIAL PRIMARY KEY,
    rule_code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    event_type_target VARCHAR(48) NOT NULL,
    threshold INTEGER NOT NULL DEFAULT 1,
    time_window_minutes INTEGER NOT NULL DEFAULT 5,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    explanation_template TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    alert_uid VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    status VARCHAR(24) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Acknowledged', 'Investigating', 'Resolved', 'False Positive')),
    rule_id INTEGER NOT NULL REFERENCES detection_rules(id),
    trigger_event_id INTEGER REFERENCES security_events(id) ON DELETE SET NULL,
    source_ip VARCHAR(64) NOT NULL,
    target_username VARCHAR(64) NOT NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    investigation_notes TEXT NOT NULL DEFAULT '',
    explanation TEXT NOT NULL,
    event_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    incident_uid VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(16) NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    status VARCHAR(24) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'INVESTIGATING', 'CONTAINED', 'RESOLVED')),
    alert_id INTEGER REFERENCES alerts(id) ON DELETE SET NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    resolution_summary TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS incident_notes (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS response_actions (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    performed_by INTEGER NOT NULL REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    action_details TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS threat_indicators (
    id SERIAL PRIMARY KEY,
    indicator_type VARCHAR(16) NOT NULL CHECK (indicator_type IN ('ipv4', 'domain', 'url', 'hash')),
    indicator_value VARCHAR(255) NOT NULL,
    reputation_score INTEGER NOT NULL DEFAULT 0,
    verdict VARCHAR(24) NOT NULL,
    source VARCHAR(48) NOT NULL,
    raw_summary JSONB NOT NULL,
    queried_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    cached_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    resource_type VARCHAR(48) NOT NULL,
    resource_id VARCHAR(64) NOT NULL DEFAULT '',
    details TEXT NOT NULL DEFAULT '',
    ip_address VARCHAR(64) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(80) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT NOT NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pg_events_ts ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_pg_events_ip ON security_events(source_ip);
CREATE INDEX IF NOT EXISTS idx_pg_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_pg_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_pg_threat_lookup ON threat_indicators(indicator_type, indicator_value);

from datetime import datetime, timezone
from app.extensions import db


def utcnow():
    return datetime.now(timezone.utc)


class Role(db.Model):
    __tablename__ = "roles"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    failed_login_attempts = db.Column(db.Integer, default=0, nullable=False)
    locked_until = db.Column(db.DateTime(timezone=True))
    last_login_at = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    role = db.relationship("Role", backref="users")


class SecurityEvent(db.Model):
    __tablename__ = "security_events"
    id = db.Column(db.Integer, primary_key=True)
    event_uid = db.Column(db.String(32), unique=True, nullable=False)
    timestamp = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False, index=True)
    source_ip = db.Column(db.String(64), nullable=False, index=True)
    username = db.Column(db.String(64), nullable=False)
    event_type = db.Column(db.String(48), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(16), nullable=False, index=True)
    user_agent = db.Column(db.String(255), default="", nullable=False)
    detection_status = db.Column(db.String(32), default="Processed", nullable=False)
    rule_triggered = db.Column(db.String(32))
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)


class DetectionRule(db.Model):
    __tablename__ = "detection_rules"
    id = db.Column(db.Integer, primary_key=True)
    rule_code = db.Column(db.String(32), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    event_type_target = db.Column(db.String(48), nullable=False)
    threshold = db.Column(db.Integer, default=1, nullable=False)
    time_window_minutes = db.Column(db.Integer, default=5, nullable=False)
    severity = db.Column(db.String(16), nullable=False)
    is_enabled = db.Column(db.Boolean, default=True, nullable=False)
    explanation_template = db.Column(db.Text, default="", nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class Alert(db.Model):
    __tablename__ = "alerts"
    id = db.Column(db.Integer, primary_key=True)
    alert_uid = db.Column(db.String(32), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(16), nullable=False, index=True)
    status = db.Column(db.String(24), default="New", nullable=False, index=True)
    rule_id = db.Column(db.Integer, db.ForeignKey("detection_rules.id"), nullable=False)
    trigger_event_id = db.Column(db.Integer, db.ForeignKey("security_events.id", ondelete="SET NULL"))
    source_ip = db.Column(db.String(64), nullable=False)
    target_username = db.Column(db.String(64), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    investigation_notes = db.Column(db.Text, default="", nullable=False)
    explanation = db.Column(db.Text, nullable=False)
    event_count = db.Column(db.Integer, default=1, nullable=False)
    window_start = db.Column(db.DateTime(timezone=True), nullable=False)
    window_end = db.Column(db.DateTime(timezone=True), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class Incident(db.Model):
    __tablename__ = "incidents"
    id = db.Column(db.Integer, primary_key=True)
    incident_uid = db.Column(db.String(32), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(16), nullable=False)
    status = db.Column(db.String(24), default="NEW", nullable=False, index=True)
    alert_id = db.Column(db.Integer, db.ForeignKey("alerts.id", ondelete="SET NULL"))
    assigned_to = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    resolution_summary = db.Column(db.Text, default="", nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    closed_at = db.Column(db.DateTime(timezone=True))


class IncidentNote(db.Model):
    __tablename__ = "incident_notes"
    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    note = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)


class ResponseAction(db.Model):
    __tablename__ = "response_actions"
    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    performed_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    action_type = db.Column(db.String(100), nullable=False)
    action_details = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(32), default="Completed", nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)


class ThreatIndicator(db.Model):
    __tablename__ = "threat_indicators"
    id = db.Column(db.Integer, primary_key=True)
    indicator_type = db.Column(db.String(16), nullable=False)
    indicator_value = db.Column(db.String(255), nullable=False)
    reputation_score = db.Column(db.Integer, default=0, nullable=False)
    verdict = db.Column(db.String(24), nullable=False)
    source = db.Column(db.String(48), nullable=False)
    raw_summary = db.Column(db.Text, nullable=False)
    queried_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    cached_until = db.Column(db.DateTime(timezone=True), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)


class AuditLog(db.Model):
    __tablename__ = "audit_logs"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    username = db.Column(db.String(64), nullable=False)
    action = db.Column(db.String(64), nullable=False)
    resource_type = db.Column(db.String(48), nullable=False)
    resource_id = db.Column(db.String(64), default="", nullable=False)
    details = db.Column(db.Text, default="", nullable=False)
    ip_address = db.Column(db.String(64), default="", nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow, nullable=False)


class SystemSetting(db.Model):
    __tablename__ = "system_settings"
    id = db.Column(db.Integer, primary_key=True)
    setting_key = db.Column(db.String(80), unique=True, nullable=False)
    setting_value = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=False)
    updated_by = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"))
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

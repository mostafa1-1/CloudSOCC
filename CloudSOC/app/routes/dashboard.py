from flask import Blueprint, jsonify, render_template, request
from app.models import Alert, Incident, SecurityEvent
from app.security.auth import admin_required, login_required

dashboard_bp = Blueprint("dashboard", __name__)
events_bp = Blueprint("events", __name__)
alerts_bp = Blueprint("alerts", __name__)
incidents_bp = Blueprint("incidents", __name__)
threat_intel_bp = Blueprint("threat_intel", __name__)
reports_bp = Blueprint("reports", __name__)
admin_bp = Blueprint("admin", __name__)


@dashboard_bp.route("/")
@login_required
def index():
    return render_template("dashboard.html")


@dashboard_bp.route("/api/health")
def health():
    return jsonify({"status": "healthy", "service": "CloudSOC-Python"})


@events_bp.route("/api/events")
@login_required
def list_events():
    events = SecurityEvent.query.order_by(SecurityEvent.timestamp.desc()).limit(100).all()
    return jsonify({"count": len(events)})


@alerts_bp.route("/api/alerts")
@login_required
def list_alerts():
    alerts = Alert.query.order_by(Alert.created_at.desc()).limit(100).all()
    return jsonify({"count": len(alerts)})


@incidents_bp.route("/api/incidents")
@login_required
def list_incidents():
    incidents = Incident.query.order_by(Incident.updated_at.desc()).limit(100).all()
    return jsonify({"count": len(incidents)})


@threat_intel_bp.route("/api/threat-intel", methods=["POST"])
@login_required
def query_intel():
    from app.services.threat_intel import lookup_indicator
    payload = request.get_json(silent=True) or {}
    return jsonify(lookup_indicator(payload.get("indicator_type", "ipv4"), payload.get("indicator_value", "")))


@reports_bp.route("/api/reports/export/csv")
@login_required
def export_csv():
    from flask import Response
    from app.reports.generator import generate_csv_bytes
    events = SecurityEvent.query.limit(200).all()
    rows = [{"event_uid": e.event_uid, "source_ip": e.source_ip, "severity": e.severity} for e in events]
    return Response(generate_csv_bytes(["event_uid", "source_ip", "severity"], rows), mimetype="text/csv")


@admin_bp.route("/api/admin/users")
@admin_required
def admin_users():
    return jsonify({"status": "authorized"})

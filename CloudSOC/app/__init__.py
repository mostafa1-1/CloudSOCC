def create_app(config_class=None):
    from flask import Flask
    from .config import Config
    from .extensions import db, migrate, csrf
    from .security.headers import apply_security_headers

    app = Flask(__name__)
    app.config.from_object(config_class or Config)

    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)

    @app.after_request
    def _security_headers(response):
        return apply_security_headers(response)

    from .routes.auth import auth_bp
    from .routes.dashboard import (
        dashboard_bp,
        events_bp,
        alerts_bp,
        incidents_bp,
        threat_intel_bp,
        reports_bp,
        admin_bp,
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(incidents_bp)
    app.register_blueprint(threat_intel_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(admin_bp)

    return app

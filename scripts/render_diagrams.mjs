import fs from 'node:fs';
import path from 'node:path';

fs.mkdirSync('docs/diagrams', { recursive: true });
fs.mkdirSync('deliverables', { recursive: true });

const archHtml = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { margin: 0; padding: 32px; background: #ffffff; font-family: Arial, sans-serif; color: #0f172a; }
  .frame { width: 1320px; border: 2px solid #1e293b; border-radius: 10px; padding: 28px; background: #f8fafc; }
  h1 { margin: 0 0 6px; font-size: 24px; color: #0f172a; }
  p.sub { margin: 0 0 22px; font-size: 13px; color: #475569; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; align-items: stretch; }
  .box { background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 14px; }
  .box.dark { background: #0f172a; color: #f8fafc; border-color: #1e293b; }
  .box.blue { border-color: #2563eb; background: #eff6ff; }
  .box h2 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.4px; color: #1d4ed8; }
  .box.dark h2 { color: #38bdf8; }
  ul { margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.55; }
  .arrow-row { text-align: center; font-size: 13px; font-weight: bold; color: #1d4ed8; margin: 12px 0; }
  .cloud-band { margin-top: 18px; border: 1.5px dashed #0284c7; border-radius: 8px; padding: 14px 18px; background: #f0f9ff; }
  .cloud-band h3 { margin: 0 0 8px; font-size: 13px; color: #0369a1; text-transform: uppercase; }
  .cloud-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; font-size: 12px; }
</style>
</head>
<body>
  <div class="frame">
    <h1>CloudSOC — Modular System &amp; Cloud Deployment Architecture</h1>
    <p class="sub">Team: [TEAM NAME] ([TEAM ID]) · Academic Year 2026 · Actual Implemented Components</p>
    <div class="grid">
      <div class="box dark">
        <h2>1. Presentation Tier</h2>
        <ul>
          <li>Authenticated SOC Analysts &amp; Admins</li>
          <li>Responsive Dark-Navy Web Console</li>
          <li>12 Views (Login, Dashboard, Events, Threat Intel, Alerts, Incidents, Reports, Admin)</li>
          <li>Chart.js 5-Chart Telemetry Visualizations</li>
        </ul>
      </div>
      <div class="box blue">
        <h2>2. Application &amp; Security Tier</h2>
        <ul>
          <li>HTTPS / TLS Reverse Proxy + Security Headers (CSP, XFO, nosniff)</li>
          <li>REST API Layer (Express / Flask Blueprints)</li>
          <li>bcrypt Password Hashing &amp; HttpOnly Session Cookies</li>
          <li>CSRF Token Validation &amp; RBAC Enforcement</li>
        </ul>
      </div>
      <div class="box">
        <h2>3. Detection &amp; Response Core</h2>
        <ul>
          <li>Event Collection &amp; Redaction Pipeline</li>
          <li>Rule-Based Detection Engine (RULE-001 to RULE-005)</li>
          <li>Sliding Window Deduplication &amp; IP Allowlist</li>
          <li>Incident Lifecycle Manager &amp; CSV/PDF Report Generator</li>
        </ul>
      </div>
      <div class="box">
        <h2>4. Data &amp; Intelligence Tier</h2>
        <ul>
          <li>Normalized 11-Table Relational Database (SQLite Runtime / PostgreSQL Cloud Schema)</li>
          <li>Threat Intel Proxy (VirusTotal / AbuseIPDB + Local Demo Mode)</li>
          <li>Cached Threat Indicators &amp; Immutable Audit Logs</li>
        </ul>
      </div>
    </div>
    <div class="arrow-row">User Request (HTTPS) ──▶ Web Frontend ──▶ REST API + RBAC/CSRF ──▶ Event Ingestion &amp; Rule Engine ──▶ Alert / Incident Persistence ──▶ Reports &amp; Analytics</div>
    <div class="cloud-band">
      <h3>Cloud Deployment &amp; Infrastructure Mapping (Google Cloud Target / Containerized Runtime)</h3>
      <div class="cloud-cols">
        <div><strong>Compute Hosting:</strong> Cloud Run Stateless Container (Gunicorn / Node.js, Auto-scaling 0–3 instances, Managed HTTPS)</div>
        <div><strong>Cloud Persistence:</strong> Managed PostgreSQL (Cloud SQL / Free-Tier Neon/Render) with Foreign Keys &amp; Daily Snapshot Strategy</div>
        <div><strong>Security &amp; Observability:</strong> Secret Manager for API/Session Keys, Structured Request Logging, Health Probes (/api/health)</div>
      </div>
    </div>
  </div>
</body>
</html>`;

const erHtml = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { margin: 0; padding: 28px; background: #ffffff; font-family: Arial, sans-serif; color: #0f172a; }
  .frame { width: 1320px; border: 2px solid #1e293b; border-radius: 10px; padding: 24px; background: #f8fafc; }
  h1 { margin: 0 0 4px; font-size: 22px; }
  p.sub { margin: 0 0 18px; font-size: 12px; color: #475569; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .tbl { background: #ffffff; border: 1.5px solid #94a3b8; border-radius: 6px; overflow: hidden; }
  .tbl h2 { margin: 0; padding: 8px 10px; background: #0f172a; color: #38bdf8; font-size: 12px; font-family: monospace; }
  .tbl ul { margin: 0; padding: 8px 10px 8px 22px; font-size: 11px; font-family: monospace; line-height: 1.45; }
  .rel { margin-top: 16px; background: #eff6ff; border: 1px solid #93c5fd; border-radius: 6px; padding: 10px 14px; font-size: 12px; line-height: 1.6; }
</style>
</head>
<body>
  <div class="frame">
    <h1>CloudSOC — Normalized Relational Database ER Schema (11 Core Tables + Sessions)</h1>
    <p class="sub">Aligned across SQLite runtime (server/db.ts) and PostgreSQL migration (migrations/001_initial_postgresql.sql)</p>
    <div class="grid">
      <div class="tbl"><h2>roles</h2><ul><li>PK id</li><li>UQ name (ADMIN | SECURITY_ANALYST)</li><li>description</li><li>created_at</li></ul></div>
      <div class="tbl"><h2>users</h2><ul><li>PK id</li><li>UQ username, email</li><li>password_hash (bcrypt)</li><li>FK role_id → roles.id</li><li>is_active, failed_login_attempts</li><li>locked_until, last_login_at</li></ul></div>
      <div class="tbl"><h2>security_events</h2><ul><li>PK id, UQ event_uid</li><li>timestamp (IDX)</li><li>source_ip (IDX), username</li><li>event_type (IDX), severity (IDX)</li><li>detection_status, rule_triggered</li></ul></div>
      <div class="tbl"><h2>detection_rules</h2><ul><li>PK id, UQ rule_code</li><li>name, event_type_target</li><li>threshold, time_window_minutes</li><li>severity, is_enabled</li></ul></div>
      <div class="tbl"><h2>alerts</h2><ul><li>PK id, UQ alert_uid</li><li>FK rule_id → detection_rules.id</li><li>FK trigger_event_id → security_events.id</li><li>FK assigned_to → users.id</li><li>severity, status, event_count</li><li>window_start, window_end</li></ul></div>
      <div class="tbl"><h2>incidents</h2><ul><li>PK id, UQ incident_uid</li><li>FK alert_id → alerts.id</li><li>FK assigned_to → users.id</li><li>FK created_by → users.id</li><li>priority, status (NEW..RESOLVED)</li><li>resolution_summary, closed_at</li></ul></div>
      <div class="tbl"><h2>incident_notes</h2><ul><li>PK id</li><li>FK incident_id → incidents.id</li><li>FK author_id → users.id</li><li>note, created_at</li></ul></div>
      <div class="tbl"><h2>response_actions</h2><ul><li>PK id</li><li>FK incident_id → incidents.id</li><li>FK performed_by → users.id</li><li>action_type, action_details, status</li></ul></div>
      <div class="tbl"><h2>threat_indicators</h2><ul><li>PK id</li><li>indicator_type, indicator_value</li><li>reputation_score, verdict, source</li><li>FK queried_by → users.id</li><li>cached_until</li></ul></div>
      <div class="tbl"><h2>audit_logs</h2><ul><li>PK id</li><li>FK user_id → users.id</li><li>username, action, resource_type</li><li>resource_id, details, ip_address</li></ul></div>
      <div class="tbl"><h2>system_settings</h2><ul><li>PK id, UQ setting_key</li><li>setting_value, description</li><li>FK updated_by → users.id</li><li>updated_at</li></ul></div>
      <div class="tbl"><h2>sessions</h2><ul><li>PK id, UQ token_hash</li><li>FK user_id → users.id</li><li>csrf_token, expires_at</li><li>ip_address, user_agent</li></ul></div>
    </div>
    <div class="rel">
      <strong>Key Foreign-Key Relationships (1:N):</strong> roles (1) ──▶ (N) users · detection_rules (1) ──▶ (N) alerts · security_events (1) ──▶ (N) alerts · alerts (1) ──▶ (0..N) incidents · incidents (1) ──▶ (N) incident_notes &amp; response_actions · users (1) ──▶ (N) audit_logs, sessions, threat_indicators.
    </div>
  </div>
</body>
</html>`;

const authHtml = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { margin: 0; padding: 28px; background: #ffffff; font-family: Arial, sans-serif; color: #0f172a; }
  .frame { width: 1200px; border: 2px solid #1e293b; border-radius: 10px; padding: 24px; background: #f8fafc; }
  h1 { margin: 0 0 6px; font-size: 20px; }
  p.sub { margin: 0 0 18px; font-size: 12px; color: #475569; }
  .steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
  .step { background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px; font-size: 12px; }
  .step .num { display: inline-block; background: #1d4ed8; color: #fff; font-weight: bold; padding: 2px 7px; border-radius: 4px; font-size: 11px; margin-bottom: 6px; }
  .step h3 { margin: 0 0 6px; font-size: 13px; }
</style>
</head>
<body>
  <div class="frame">
    <h1>CloudSOC — Authentication, CSRF &amp; RBAC Security Flow</h1>
    <p class="sub">Server-side credential verification, brute-force telemetry logging, HttpOnly cookies, and role enforcement</p>
    <div class="steps">
      <div class="step"><span class="num">STEP 1</span><h3>Credential Submit</h3><p>User submits email/username &amp; password over HTTPS POST /api/auth/login.</p></div>
      <div class="step"><span class="num">STEP 2</span><h3>Lockout &amp; bcrypt</h3><p>Server checks active status &amp; lockout timestamp, then compares bcrypt hash (cost 10).</p></div>
      <div class="step"><span class="num">STEP 3</span><h3>Event &amp; Detection</h3><p>Failed or successful login writes to security_events (password redacted) and triggers RULE-001/002.</p></div>
      <div class="step"><span class="num">STEP 4</span><h3>Session &amp; CSRF</h3><p>On success, SHA-256 hashed token stored in DB; HttpOnly + SameSite=Lax cookie + CSRF token issued.</p></div>
      <div class="step"><span class="num">STEP 5</span><h3>RBAC Guard</h3><p>Protected routes verify session + X-CSRF-Token; Admin routes reject SECURITY_ANALYST with HTTP 403.</p></div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync('docs/diagrams/arch.html', archHtml);
fs.writeFileSync('docs/diagrams/er.html', erHtml);
fs.writeFileSync('docs/diagrams/auth.html', authHtml);
console.log('Diagram HTML sources written.');

# CloudSOC — Cloud-Based Security Monitoring & Incident Response Platform

CloudSOC is a full-stack Security Operations Center (SOC) platform built for the **Cloud Computing 2026** university project. It provides centralized security event ingestion, rule-based threat detection, threat intelligence enrichment, alert triage, incident lifecycle management, audit logging, and CSV/PDF compliance reporting.

---

## Core Modules (10 Integrated Modules)

1. **SOC Dashboard (`/`)** — Database-driven KPIs (total events, total alerts, critical alerts, high-risk events, open/resolved incidents) and interactive Chart.js visualizations with timeframe filters (`7 / 14 / 30 days`) and auto-refresh.
2. **Security Events (`/events`)** — Searchable, filterable event stream with manual event ingestion and an authorized brute-force simulation helper for testing detection rules.
3. **Threat Intelligence (`/threat-intel`)** — IPv4, domain, URL, and file hash reputation lookups supporting optional `VIRUSTOTAL_API_KEY` and `ABUSEIPDB_API_KEY`, with automatic **Local Demonstration Mode** fallback when keys are absent.
4. **Threat Detection Engine (`/detection-engine`)** — Live correlation engine implementing 5 configurable rules (`RULE-001` through `RULE-005`), sliding time-window evaluation, allowlist suppression, trigger counts, and controlled verification testing.
5. **Alerts Management (`/alerts`)** — Rule-triggered alert queue with detection explanations, analyst assignment, investigation notes, status triage (`New`, `Acknowledged`, `Investigating`, `Resolved`, `False Positive`), and one-click escalation to incidents.
6. **Incident Response (`/incidents`)** — Full case management enforcing `NEW → INVESTIGATING → CONTAINED → RESOLVED` transitions, investigation notes, manual response action logs, and case audit trails.
7. **Security Reports (`/reports`)** — Five database-verified report categories (`events`, `alerts`, `incidents`, `severity`, `analyst_activity`) with date/severity filters and authenticated CSV & PDF exports.
8. **Audit Logs (`/audit-logs`)** — Searchable, filterable chronological trail of authentication, configuration, triage, and incident actions with CSV export.
9. **User Management (`/users`, Admin-only)** — RBAC account provisioning (`ADMIN` vs `SECURITY_ANALYST`), role updates, account activation/disabling, and lockout reset.
10. **System Settings (`/settings`, Admin-only) & User Profile (`/profile`)** — Global allowlist IPs, lockout thresholds, detection rule tuning, profile updates, and password rotation.

---

## Evaluation Demo Credentials

Safe demonstration accounts are seeded automatically on startup (the login screen provides **Use Admin Demo** and **Use Analyst Demo** quick-fill buttons without exposing raw credentials in public production UI):

| Role | Email | Username | Password |
| :--- | :--- | :--- | :--- |
| Administrator (`ADMIN`) | `admin@cloudsoc.local` | `soc_admin` | `Admin@CloudSOC2026!` |
| Security Analyst (`SECURITY_ANALYST`) | `analyst@cloudsoc.local` | `sec_analyst` | `Analyst@CloudSOC2026!` |

---

## Database Configuration & Migrations

- **Local Development / Evaluation**: Uses built-in Node.js SQLite (`node:sqlite`) persisted automatically to disk (`./data/cloudsoc.db` by default).
- **Environment Variable Resolution**:
  - `DATABASE_PATH`: File path for SQLite storage (e.g. `./data/cloudsoc.db`).
  - `DATABASE_URL`: Supports `sqlite:///./data/cloudsoc.db`, `file:./data/cloudsoc.db`, `sqlite:///:memory:`, or PostgreSQL connection URLs (`postgresql://...`). When a PostgreSQL URL is present in local preview mode without an external PostgreSQL server, the runtime cleanly falls back to `DATABASE_PATH` (or `./data/cloudsoc.db`) so evaluation works without paid database services.
- **Versioned Migrations**: Startup runs transactional migrations tracked in the `schema_migrations` table (`001_initial_schema`, `002_indexes_and_audit_filters`).
- **Cloud PostgreSQL Schema & Python Reference Implementation**: See `/CloudSOC/migrations/001_initial_postgresql.sql` and `/CloudSOC/CLOUD_DEPLOYMENT_AND_COST_ANALYSIS.md`.

---

## Optional Threat Intelligence API Keys

Configure via environment variables (never exposed to browser JavaScript):
- `VIRUSTOTAL_API_KEY` — Optional VirusTotal v3 API key for domain, URL, hash, and IP lookups.
- `ABUSEIPDB_API_KEY` — Optional AbuseIPDB v2 API key for IPv4 abuse confidence scoring.

When neither key is set, Threat Intelligence operates transparently in **Local Demonstration Mode** and clearly labels results as `Local Demonstration`.

---

## Running & Testing Locally

```bash
# Install dependencies
npm install

# Start development server (Express API + Vite SPA on port 3000)
npm run dev

# Type-check & production build
npm run lint
npm run build

# Run Node.js unit & integration tests
npx tsx --test server/*.test.ts

# Run Python reference service unit tests
PYTHONPATH=CloudSOC python3 -m unittest discover -s CloudSOC/tests -t CloudSOC -p "test_*.py" -v
```

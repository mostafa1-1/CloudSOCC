# CloudSOC — End-to-End Quality Assurance (QA) Test Report

**Application:** CloudSOC — Cloud-Based Security Monitoring & Incident Response Platform  
**Environment:** Local Express + Vite Dev Server (`http://127.0.0.1:3000`) with persistent SQLite (`cloudsoc.db`, `schema_migrations` v1–v3)  
**Test Execution Date:** 2026-11-20  

---

## 1. Executive Summary

A full-stack QA audit was executed directly against the running CloudSOC application, SQLite database, REST APIs, and Chromium browser UI (`playwright-cli`), alongside automated Node (`node:test`) and Python (`unittest`) test suites.

- **Automated Unit & Integration Tests:** **17/17** Node tests (`server/*.test.ts`) and **4/4** Python engine tests (`CloudSOC/tests/unit/test_detection_and_validation.py`) passed.
- **TypeScript & Production Bundle Verification:** `tsc --noEmit` (`lint_applet`) and `npm run build` (`compile_applet`) succeeded with zero errors.
- **Browser Console & UI Responsiveness:** Desktop (`1440×900`) and Mobile (`390×844`) views rendered with **0** uncaught JavaScript errors, **0** React/Vite WebSocket warnings, and **0** horizontal overflow (`scrollWidth <= innerWidth + 2`).
- **Defect Discovered & Fixed During QA:** `PATCH /api/rules/:id` previously coerced non-numeric `threshold` and `time_window_minutes` inputs via `Number(...)` without `Number.isFinite(...)`, permitting `NaN` propagation. Fixed in `server/app.ts` and covered by regression test `server/qa_e2e.test.ts`.
- **Not Tested / Out-of-Scope External Integrations:** Live VirusTotal and AbuseIPDB external API calls (no external API keys configured — verified in **Local Demonstration Mode**), external cloud firewall block execution (response actions recorded as auditable manual steps), and live PostgreSQL server runtime (tested against SQLite; PostgreSQL schema/DSN parity maintained by design).

---

## 2. Detailed QA Test Matrix

| ID | Area | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| QA-01 | Authentication | Unauthenticated access to `/api/dashboard` | Rejected with HTTP `401` | Returned `HTTP 401` | **Passed** |
| QA-02 | Authentication | Invalid credentials (`invalid_qa_probe`) via UI Sign In | Rejected with `401` and error banner | `[role=alert]` displayed; `HTTP 401` logged | **Passed** |
| QA-03 | Authentication | Admin Demo login (`Use Admin Demo` → `Sign In`) | Populates credentials, authenticates, loads Dashboard | Navigated to Dashboard; authenticated as `soc_admin` | **Passed** |
| QA-04 | Authentication | Session persistence across `page.reload()` & `clearCookies()` | Remains authenticated via Bearer session fallback + CSRF validation | Stayed signed in across reload and cookie clear; `sessionStorage` tokens verified | **Passed** |
| QA-05 | Authentication | Logout & Analyst Demo login (`Use Analyst Demo` → `Sign In`) | Logout invalidates session; Analyst logs in cleanly | Signed out to login screen; Analyst signed in cleanly | **Passed** |
| QA-06 | Authentication | Account lockout & Admin unlock (`qa_e2e.test.ts`) | 12 consecutive failures return `423 Locked`; Admin unlock restores `200` | Verified `423` on failure #12 and `200` after `PATCH /api/users/:id { unlock: true }` | **Passed** |
| QA-07 | Dashboard | Database KPI & Chart.js accuracy | KPI cards match SQLite `SELECT COUNT(*)` & update dynamically | Pre-test: `114` events / `15` alerts / `6` critical / `3` resolved → Post-test: `127` events / `17` alerts / `7` critical / `4` resolved; all Chart.js `<canvas>` rendered | **Passed** |
| QA-08 | Security Events | Create manual event (`POST /api/events`), search, severity filter, Inspect modal | Event saved (`EVT-2026-0127`), searchable, filterable, Inspect modal opens/closes | `EVT-2026-0127` (`198.51.100.77`, `qa_manual_235636`) persisted, filtered, and inspected cleanly | **Passed** |
| QA-09 | Detection Engine | 10 failed login attempts against local account `qa_brute_235636` from test IP `198.51.100.36` | Attempt #4 triggers `RULE-002` (High); Attempt #10 triggers `RULE-001` (Critical) + summary event + exact timestamps | `ALT-2026-0016` (`High`, `RULE-002`, `4 event(s)`) and `ALT-2026-0017` (`Critical`, `RULE-001`, `10 event(s)`, `2026-11-20 12:37:24 UTC`) generated automatically; subsequent duplicate IP burst deduplicated | **Passed** |
| QA-10 | Detection Engine | Non-numeric `threshold` (`"not-a-number"`) on `PATCH /api/rules/1` | Reject/ignore invalid `NaN` and preserve existing threshold `10` | **Initially Failed** (`Number()` yielded `NaN`); **Fixed** in `server/app.ts` with `Number.isFinite()`, re-tested & **Passed** | **Passed (Fixed)** |
| QA-11 | Alerts | Filter alerts, save triage note, escalate alert to incident | Alert searchable by target username; note saved; `ALT-2026-0017` escalates to Incident | `ALT-2026-0017` updated and escalated cleanly to `INC-2026-0008` | **Passed** |
| QA-12 | Incident Response | Escalated incident lifecycle (`NEW → INVESTIGATING → CONTAINED → RESOLVED`), notes, response actions, audit trail | All transitions, investigation notes, manual containment actions, resolution summary, and audit entries persist | `INC-2026-0008` transitioned through all 4 states with note, `Credential Rotation` action, resolution summary, and full `Case Audit Trail` | **Passed** |
| QA-13 | Incident Response | Manual incident creation modal (`+ Create Incident`) | Creates new `NEW` incident in SQLite | Created `INC-2026-0012` (`QA UI Modal Incident 47331`) via UI modal | **Passed** |
| QA-14 | RBAC | Analyst attempts `PATCH /api/settings`, `PATCH /api/rules/1`, `POST /api/users`, and `/users` route | Backend rejects with `403`; UI displays `403 Administrator Access Required` | Backend returned `403` on all privileged routes; `/users` UI showed `Administrator Access Required` | **Passed** |
| QA-15 | Reports | Switch report categories & export CSV / PDF | Reports match DB rows; CSV escaped; PDF starts with `%PDF-1.3` | `.playwright-cli/qa-report.csv` (13 KB) and `.playwright-cli/qa-report.pdf` (11 KB, `%PDF-1.3`) downloaded and verified | **Passed** |
| QA-16 | Database & Persistence | Live dev server restart (`restart_dev_server`) + `PRAGMA foreign_key_check` | `EVT-2026-0127` and `INC-2026-0008` remain queryable after restart; `0` FK violations | Post-restart UI search & SQLite check confirmed `INC-2026-0008` (`RESOLVED`), `EVT-2026-0127`, `145` audit logs, `fkViolations: 0` | **Passed** |
| QA-17 | Frontend & Modules | All 11 sidebar routes, Threat Intel local demo lookup (`185.220.101.42`), Detection Engine rules, Audit Logs, Users Add modal, Profile update/restore, Mobile `390×844` | All 11 routes load without console errors or horizontal overflow | All 11 routes verified; `qa_modal_47331` created via UI; Profile updated & restored; `scrollWidth <= innerWidth + 2` | **Passed** |
| QA-18 | External Integrations | Live VirusTotal / AbuseIPDB API queries & live PostgreSQL server runtime | External API HTTP 200 responses / live PostgreSQL queries | No external API keys or external PostgreSQL server provisioned in local evaluation environment (Demo mode & SQLite verified instead) | **Not Tested** |

---

## 3. Defects Discovered & Resolved

1. **Defect #1 — Missing `Number.isFinite` Validation in `PATCH /api/rules/:id` (`server/app.ts`)**
   - **Severity:** Medium (Input Validation / Data Integrity)
   - **Root Cause:** `req.body?.threshold !== undefined ? Math.max(1, Math.min(500, Math.round(Number(req.body.threshold))))` produced `NaN` when passed non-numeric input.
   - **Resolution:** Added explicit `Number.isFinite(rawThreshold)` and `Number.isFinite(rawWindow)` guards with fallback to existing rule values. Covered by `server/qa_e2e.test.ts` and verified passing.

---

## 4. Captured Browser Verification Artifacts

- `.playwright-cli/qa-dashboard.png` — Live Dashboard (`1440×900`, Chart.js + SQLite KPIs before brute-force simulation)
- `.playwright-cli/qa-alerts.png` — Alerts view showing auto-generated `ALT-2026-0016` (`RULE-002`) & `ALT-2026-0017` (`RULE-001`) for `qa_brute_235636`
- `.playwright-cli/qa-incidents.png` — Resolved incident `INC-2026-0008` modal with notes, containment action, and audit trail
- `.playwright-cli/qa-mobile.png` — Mobile responsive Dashboard (`390×844`) reflecting updated live telemetry (`127` events, `17` alerts, `7` critical, `4` resolved incidents)
- `.playwright-cli/qa-report.csv` & `.playwright-cli/qa-report.pdf` — Downloaded CSV and PDF audit report exports

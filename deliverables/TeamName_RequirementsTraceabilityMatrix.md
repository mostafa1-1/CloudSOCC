# CloudSOC Requirements Traceability Matrix (RTM)

**Team:** [TEAM NAME] ([TEAM ID])  
**University / Faculty:** [UNIVERSITY NAME] — [FACULTY NAME]  
**Course:** Cloud Computing | **Academic Year:** 2026  
**Team Members:** [MEMBER 1 NAME] ([MEMBER 1 ID]), [MEMBER 2 NAME] ([MEMBER 2 ID])

> **Guideline Inspection Note:** No external image files were attached to the project prompt. All mandatory and recommended academic specifications were extracted directly from Section 3 ("Official University Guidelines — Mandatory Reference") and Sections 4–28 of the prompt specification.

| Req ID | Academic / Functional Requirement | Priority | Mapped System Feature / Deliverable | Verification Method | Status |
|---|---|---|---|---|---|
| REQ-01 | 15-slide presentation, 8–10 min, 18pt+ body, 3–5 bullets, exact 15 sections | Mandatory | `deliverables/TeamName_Presentation.pptx` + Speaking Script | Slide count & font inspection | Verified |
| REQ-02 | Editable DOCX + PDF documentation (12–15 pages, TNR 12pt, 14pt headings, 14 sections) | Mandatory | `deliverables/TeamName_Documentation.docx` & `.pdf` | Page count & formatting audit | Verified |
| REQ-03 | Numbered figures & tables referenced in report text + 10–12 genuine screenshots | Mandatory | `docs/screenshots/TeamName_Fig01..12.png` embedded in DOCX/PDF/PPTX | Playwright capture & visual check | Verified |
| REQ-04 | Minimum 5 verified official/academic references | Mandatory | IEEE/NIST/OWASP/Flask/PostgreSQL/Google Cloud citations | URL & publication check | Verified |
| REQ-05 | Demonstrate 4–6 Cloud Computing concepts with evidence | Mandatory | Section 5 & 9 of Documentation (Scalability, Availability, Cloud Storage, Cloud DB, Cloud Security, Monitoring) | Architecture & code mapping | Verified |
| REQ-06 | Authentication, bcrypt hashing, session cookies, CSRF & RBAC (ADMIN vs SECURITY_ANALYST) | Mandatory | `server/app.ts`, `CloudSOC/app/security/`, Login/Register/Users pages | Integration & security tests | Verified |
| REQ-07 | Security Event collection, search, filters, date range, password redaction | Mandatory | `security_events` table, `/api/events`, `SecurityEventsPage.tsx` | Integration & Playwright tests | Verified |
| REQ-08 | Rule-based Threat Detection Engine (Brute-force 10/5m, deduplication, allowlist) | Mandatory | `server/detection.ts`, `CloudSOC/app/detection/engine.py` | Node & Python unit tests + E2E | Verified |
| REQ-09 | Threat Intelligence (IPv4/Domain/URL/Hash) with backend keys & labeled Demo Mode | Mandatory | `server/threatIntel.ts`, `ThreatIntelPage.tsx` | API & Playwright tests | Verified |
| REQ-10 | Alert triage, status workflow, notes, and Incident lifecycle (NEW→INVESTIGATING→CONTAINED→RESOLVED) | Mandatory | `AlertsPage.tsx`, `IncidentsPage.tsx`, `audit_logs` | E2E functional & persistence tests | Verified |
| REQ-11 | Real DB Dashboard (5 Chart.js charts) & CSV/PDF Report Exports | Mandatory | `DashboardPage.tsx`, `ReportsPage.tsx`, `server/reports.ts` | Playwright & PDF header checks | Verified |
| REQ-12 | Cloud deployment strategy & cost approval gate | Mandatory | `CloudSOC/deployment/` & Section 10 Cost Analysis | Documented; awaiting cost approval | Ready for Approval |

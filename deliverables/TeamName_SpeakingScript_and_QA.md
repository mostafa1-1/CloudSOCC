# CloudSOC — Presentation Speaking Script & Professor Q&A Preparation

**Team:** [TEAM NAME] ([TEAM ID]) | **Course:** Cloud Computing (2026)  
**Target Duration:** 9 minutes (540 seconds), divided evenly between **[MEMBER 1 NAME]** and **[MEMBER 2 NAME]**.

---

## Part A: Fairly Divided 9-Minute Speaking Script

- **Slide 1 — Title (0:00–0:25) — [MEMBER 1 NAME]:**  
  "Good morning/afternoon, Professors and colleagues. We are Team [TEAM NAME]. Today we present CloudSOC, our Cloud-Based Security Monitoring and Incident Response Platform designed for the 2026 Cloud Computing course."

- **Slide 2 — Agenda (0:25–0:50) — [MEMBER 1 NAME]:**  
  "Our presentation covers the security problem we address, our objectives, core cloud computing concepts, our modular system architecture, live implementation and testing evaluation, cloud advantages, scalability roadmap, and conclusions."

- **Slide 3 — Introduction (0:50–1:25) — [MEMBER 1 NAME]:**  
  "Modern cloud workloads face continuous authentication probing and unauthorized API scans. Traditional on-premise SIEM tools require heavy infrastructure. CloudSOC demonstrates how a lightweight cloud-hosted Security Operations Center centralizes event telemetry, rule-based detection, and incident response in a unified browser workspace."

- **Slide 4 — Problem Statement (1:25–2:00) — [MEMBER 1 NAME]:**  
  "Small and mid-sized cloud teams suffer from fragmented logs, delayed brute-force detection, uncoordinated incident handoffs, and high upfront hardware costs. Without automated correlation and audit trails, repeated credential attacks go unnoticed until compromise occurs."

- **Slide 5 — Objectives (2:00–2:35) — [MEMBER 1 NAME]:**  
  "Our primary objectives were to build a multi-role SOC platform with secure authentication, implement a deterministic rule-based detection engine with sliding-window deduplication, integrate threat intelligence with safe local fallback, support full alert-to-incident lifecycle tracking, and export database-verified CSV and PDF reports."

- **Slide 6 — Theoretical Concepts (2:35–3:20) — [MEMBER 1 NAME]:**  
  "CloudSOC grounds six core Cloud Computing principles: horizontal compute Scalability via stateless containers, Availability through health-monitored managed services, Cloud Storage for generated reports and artifacts, Cloud Database persistence with ACID relational integrity, Cloud Security via defense-in-depth, and continuous Monitoring of authentication telemetry."

- **Slide 7 — Proposed Solution (3:20–3:55) — [MEMBER 2 NAME]:**  
  "Thank you, [MEMBER 1 NAME]. CloudSOC delivers a twelve-screen enterprise web console backed by a normalized eleven-table relational database. Analysts can ingest and filter security events, inspect threat indicators, triage rule-generated alerts, manage incidents from NEW to RESOLVED, and export audit reports."

- **Slide 8 — Architecture (3:55–4:45) — [MEMBER 2 NAME]:**  
  "As shown in our architecture diagram, HTTPS traffic enters the Application and Security Tier, which enforces HTTP security headers, bcrypt password hashing, HttpOnly session cookies, CSRF tokens, and RBAC. Incoming events pass immediately through our five-rule detection engine before persisting alerts and incidents to the relational database. We deliver both the full Python/Flask/PostgreSQL deployment repository and our live interactive TypeScript/Node runtime."

- **Slide 9 — Implementation (4:45–5:40) — [MEMBER 2 NAME]:**  
  "During implementation, we built five configurable detection rules, led by RULE-001 which triggers a Critical alert at ten failed logins within five minutes while suppressing duplicate noise. Threat intelligence queries VirusTotal or AbuseIPDB exclusively from the backend, or switches cleanly to a clearly labeled Local Demonstration mode when keys are absent."

- **Slide 10 — Results and Evaluation (5:40–6:30) — [MEMBER 2 NAME]:**  
  "We verified CloudSOC across unit, integration, security, browser, and performance tests. All twelve Node.js tests and four Python unit tests passed, including a full twelve-step brute-force workflow and server-restart persistence check. Live benchmarks averaged 4.62 milliseconds for dashboard analytics and 7.34 milliseconds for event ingestion with rule evaluation."

- **Slide 11 — Cloud Advantages (6:30–7:10) — [MEMBER 1 NAME]:**  
  "Compared to traditional on-premise servers requiring manual patching, static capacity sizing, and capital hardware expense, cloud hosting on serverless containers like Cloud Run provides pay-per-use efficiency, managed TLS certificates, rapid deployment, and centralized secret management."

- **Slide 12 — Scalability Plan (7:10–7:45) — [MEMBER 1 NAME]:**  
  "Because session tokens are stored in the database rather than process memory, application containers scale horizontally from zero to multiple instances. Future growth can introduce an asynchronous message queue such as Cloud Pub/Sub and read replicas for high-volume log analytics."

- **Slide 13 — Limitations and Future Work (7:45–8:20) — [MEMBER 2 NAME]:**  
  "Current limitations include reliance on single-node SQLite in the local evaluation container versus managed PostgreSQL in production, rule-based rather than statistical anomaly detection, and manual containment logging. Future work adds live Syslog/Cloud Audit Log collectors, MFA, and SOAR webhook playbooks."

- **Slide 14 — Conclusion (8:20–8:45) — [MEMBER 2 NAME]:**  
  "In conclusion, CloudSOC successfully combines practical cloud architecture with defensive cybersecurity engineering—delivering verifiable detection, strict OWASP controls, and audit-ready incident workflows."

- **Slide 15 — References (8:45–9:00) — [MEMBER 2 NAME]:**  
  "Here are our primary academic and technical references, including NIST SP 800-145, NIST SP 800-61, and the OWASP Top 10. Thank you, and we welcome your questions."

---

## Part B: 22 Professor Questions and Answers

1. **Q: How does CloudSOC demonstrate Cloud Computing rather than just a normal web app?**  
   A: CloudSOC separates stateless compute containers from persistent relational storage, uses externalized environment/secret configuration, exposes `/api/health` readiness probes for cloud load balancers, and implements managed TLS, horizontal container scaling manifests, and cloud cost/provider evaluation across AWS, Azure, and GCP.
2. **Q: Why is rule-based detection used instead of calling it Artificial Intelligence?**  
   A: Transparent cybersecurity engineering requires deterministic, explainable thresholds (e.g., 10 failed logins in 5 minutes). Describing simple threshold logic as AI would be academically dishonest; rule-based detection provides auditable explanations for every alert.
3. **Q: How does CloudSOC prevent alert flooding during an ongoing brute-force attack?**  
   A: Before inserting an alert, the engine checks `alerts` for an open alert (`New`, `Acknowledged`, `Investigating`) sharing the same `rule_id` and `source_ip` or `target_username` within the active sliding time window.
4. **Q: What happens if a legitimate administrator mistypes a password from a trusted VPN?**  
   A: Administrators can configure an `allowlisted_ips` list in Settings to suppress automated alerts for trusted IPs, or mark an alert `False Positive` with investigation notes.
5. **Q: Why did you build both a Python/Flask codebase and a live TypeScript/Node runtime?**  
   A: The university prefers Python/Flask/PostgreSQL (delivered in `CloudSOC/` with Gunicorn, SQLAlchemy models, SQL migrations, and `unittest` tests), while the live AI Studio evaluation container runs Node.js 22 without `pip` or a PostgreSQL daemon. Documenting and maintaining schema/API parity across both lets evaluators run the live app immediately and deploy the Python stack to cloud PostgreSQL.
6. **Q: How do you protect passwords at rest and in logs?**  
   A: Passwords are hashed using bcrypt (cost factor 10). Furthermore, `redactSensitiveFields()` strips `password=...`, `secret=...`, and `token=...` patterns before saving any event description or audit log.
7. **Q: How is SQL injection prevented?**  
   A: Every SQL query uses parameterized prepared statements (SQLite `?` bindings and SQLAlchemy ORM parameter binding), never string concatenation. We verified `' OR 1=1 --` payloads in automated security tests.
8. **Q: How is Cross-Site Request Forgery (CSRF) mitigated?**  
   A: Authenticated sessions issue a random per-session `csrfToken`, and every state-mutating request (`POST`, `PATCH`, `PUT`, `DELETE`) requires a matching `X-CSRF-Token` header verified on the server.
9. **Q: What prevents a Security Analyst from accessing User Management or Settings?**  
   A: Both client routing and server-side `requireAdmin` / `@admin_required` middleware enforce RBAC. Direct API calls by a `SECURITY_ANALYST` to `/api/users` or `/api/settings` return HTTP 403 Forbidden.
10. **Q: Does CloudSOC automatically block IP addresses on the firewall?**  
    A: No. Per safe defensive design, CloudSOC never executes automated real network blocking without authorization; instead, analysts record manual containment actions and firewall recommendations in the incident audit trail.
11. **Q: How does Threat Intelligence work without paid API keys?**  
    A: When `VIRUSTOTAL_API_KEY` and `ABUSEIPDB_API_KEY` are unset, the backend switches to a clearly labeled `Local Demonstration` mode with cached indicator results and never fabricates live external scores.
12. **Q: Why are external Threat Intelligence API calls made only from the backend?**  
    A: Calling third-party APIs from the browser would expose secret API keys in client network traffic and bypass server-side caching and rate-limit handling.
13. **Q: How do you ensure data persists across application restarts?**  
    A: All state—including sessions, events, alerts, incidents, notes, response actions, and audit logs—is committed to disk-backed relational tables. Our integration test explicitly restarts the server against the same database file and verifies an `RESOLVED` incident remains intact.
14. **Q: Explain the Incident Response lifecycle in CloudSOC.**  
    A: Incidents follow a validated state machine: `NEW -> INVESTIGATING -> CONTAINED -> RESOLVED`. Invalid backward jumps (like `RESOLVED -> NEW`) are rejected by `isValidIncidentTransition`.
15. **Q: How are CSV exports protected against spreadsheet formula injection?**  
    A: `escapeCsvCell()` prefixes any cell beginning with `=`, `+`, `-`, or `@` with a single quote (`'`) before RFC-4180 quoting.
16. **Q: Why did you evaluate AWS, Azure, and Google Cloud?**  
    A: Comparing compute free tiers, managed PostgreSQL pricing, automatic TLS, and deployment simplicity showed Google Cloud Run offers the cleanest scale-to-zero free compute tier, while free-tier managed PostgreSQL (or explicitly approved Cloud SQL) keeps costs transparent.
17. **Q: Why didn't you spin up a paid Cloud SQL instance automatically?**  
    A: Project cost governance strictly prohibits creating chargeable cloud resources without explicit user financial approval. We prepared the exact PostgreSQL DDL, Dockerfile, Cloud Build YAML, and cost breakdown ready for approval.
18. **Q: What indexes exist on the database and why?**  
    A: Indexes cover `security_events(timestamp, source_ip, event_type, severity)`, `alerts(status, severity)`, `incidents(status)`, and `threat_indicators(indicator_type, indicator_value)` to keep dashboard aggregations and sliding-window queries sub-10ms.
19. **Q: How does CloudSOC protect against XSS?**  
    A: React automatically escapes rendered JSX text, Content Security Policy headers restrict script sources, and session cookies use `HttpOnly` so JavaScript cannot read session tokens.
20. **Q: What happens if a user tries to lock out an account?**  
    A: After `max_login_lockout_attempts` (default 12) consecutive failures, `locked_until` is set for 15 minutes, returning HTTP 423 while still logging telemetry; Admins can unlock accounts in User Management.
21. **Q: What metrics were observed in performance testing?**  
    A: Under local evaluation, `GET /api/dashboard` averaged 4.62 ms, `POST /api/events` (including 5-rule evaluation) averaged 7.34 ms, and PDF export averaged 46.15 ms.
22. **Q: What is the highest-priority future improvement?**  
    A: Connecting real cloud log streams (GCP Cloud Logging / AWS CloudTrail via Pub/Sub) into the ingestion endpoint alongside multi-factor authentication (TOTP) for SOC administrators.

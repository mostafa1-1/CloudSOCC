import fs from 'node:fs';

const BASE = 'http://localhost:3000';

async function timeRequest(label, fn) {
  const start = performance.now();
  const res = await fn();
  const ms = performance.now() - start;
  return { label, status: res.status, ms };
}

async function run() {
  const results = [];

  // 1. Health endpoint average (5 requests)
  const healthTimes = [];
  for (let i = 0; i < 5; i++) {
    const r = await timeRequest('GET /api/health', () => fetch(`${BASE}/api/health`));
    healthTimes.push(r.ms);
  }

  // 2. Login timing
  let cookie = '';
  let csrf = '';
  const loginRes = await timeRequest('POST /api/auth/login', async () => {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@cloudsoc.local', password: 'Admin@CloudSOC2026!' }),
    });
    cookie = (r.headers.get('set-cookie') || '').split(';')[0];
    const j = await r.json();
    csrf = j.csrfToken;
    return r;
  });

  // 3. Dashboard analytics timing (5 requests)
  const dashTimes = [];
  for (let i = 0; i < 5; i++) {
    const r = await timeRequest('GET /api/dashboard', () =>
      fetch(`${BASE}/api/dashboard?days=7`, { headers: { Cookie: cookie } })
    );
    dashTimes.push(r.ms);
  }

  // 4. Event ingestion + rule detection timing (10 requests)
  const ingestTimes = [];
  for (let i = 0; i < 10; i++) {
    const r = await timeRequest('POST /api/events', () =>
      fetch(`${BASE}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': csrf },
        body: JSON.stringify({
          source_ip: '198.51.100.150',
          username: 'perf_probe',
          event_type: 'Successful Login',
          severity: 'Low',
          description: `Performance benchmark telemetry probe #${i + 1}`,
        }),
      })
    );
    ingestTimes.push(r.ms);
  }

  // 5. PDF export timing
  const pdfRes = await timeRequest('GET /api/reports/export/pdf', () =>
    fetch(`${BASE}/api/reports/export/pdf?type=events`, { headers: { Cookie: cookie } })
  );

  const avg = (arr) => Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));
  const summary = {
    measuredAt: new Date().toISOString(),
    healthAvgMs: avg(healthTimes),
    loginMs: Number(loginRes.ms.toFixed(2)),
    dashboardAvgMs: avg(dashTimes),
    eventIngestAndDetectionAvgMs: avg(ingestTimes),
    pdfExportMs: Number(pdfRes.ms.toFixed(2)),
  };

  fs.mkdirSync('deliverables', { recursive: true });
  fs.writeFileSync('deliverables/perf_metrics.json', JSON.stringify(summary, null, 2));
  console.log('Performance benchmark results:', JSON.stringify(summary));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

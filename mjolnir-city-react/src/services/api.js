/**
 * REST adapter — talks to the Django backend.
 *
 * All functions return the parsed JSON body (or throw on non-2xx).
 * In the demo build they're wired to mock data, but the signatures
 * match what the real endpoints should expose.
 */

import { INITIAL_KPI, INITIAL_ATMO, INITIAL_EXTRA_SENSORS, MOCK_HISTORY } from '../data/mockSensors.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, init = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // TODO(backend): add Authorization: `Bearer ${token}`
      ...(init.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/* =========================================================
   Sensor endpoints
   ========================================================= */

/** GET /api/sensors/latest/ — snapshot of current values. */
export async function fetchLatestSensors() {
  // TODO(backend): return await request('/sensors/latest/');
  return Promise.resolve({
    kpi:   INITIAL_KPI,
    atmo:  INITIAL_ATMO,
    extra: INITIAL_EXTRA_SENSORS,
  });
}

/** GET /api/history/<metric>/?window=24h */
export async function fetchHistory(metric, window = '24h') {
  // TODO(backend): return await request(`/history/${metric}/?window=${window}`);
  const labels = MOCK_HISTORY.labels;
  const data = MOCK_HISTORY[metric] ?? [];
  return Promise.resolve({ metric, window, labels, data });
}

/* =========================================================
   Action endpoints
   ========================================================= */

/** POST /api/guard/summon — Summon Guard button. */
export async function summonGuard() {
  // TODO(backend): return await request('/guard/summon/', { method: 'POST' });
  return Promise.resolve({ ok: true, summonedAt: new Date().toISOString() });
}

/** POST /api/runelog/ — persist a custom log entry. */
export async function postRuneLog(entry) {
  // TODO(backend): return await request('/runelog/', { method: 'POST', body: JSON.stringify(entry) });
  return Promise.resolve({ ok: true, entry });
}

/** POST /api/alarms/ — report an alarm to the ops system. */
export async function postAlarm(alarm) {
  // TODO(backend): return await request('/alarms/', { method: 'POST', body: JSON.stringify(alarm) });
  return Promise.resolve({ ok: true, alarm });
}

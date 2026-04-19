/**
 * REST adapter — talks to the Django backend.
 *
 * All functions return the parsed JSON body (or throw on non-2xx).
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, init = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
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
  return await request('/sensors/latest/');
}

/**
 * GET /api/sensors/history/?metric=temp&window=1h&device=...&limit=500
 *
 * Returns { metric, device, window, count, points: [{ ts, raw, filtered, risk_score }] }
 */
export async function fetchSensorHistory(metric = 'temp', window = '1h', device = null, limit = 500) {
  let path = `/sensors/history/?metric=${metric}&window=${window}&limit=${limit}`;
  if (device) path += `&device=${encodeURIComponent(device)}`;
  return await request(path);
}

/** GET /api/sensors/devices/ — list of devices */
export async function fetchDevices() {
  return await request('/sensors/devices/');
}

/* =========================================================
   Alarm endpoints
   ========================================================= */

/** GET /api/alarms/ */
export async function fetchAlarms() {
  return await request('/alarms/');
}

/** POST /api/alarms/ — report an alarm to the ops system. */
export async function postAlarm(alarm) {
  return await request('/alarms/', {
    method: 'POST',
    body: JSON.stringify(alarm),
  });
}

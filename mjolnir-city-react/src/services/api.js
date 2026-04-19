
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

export async function fetchLatestSensors() {
  return await request('/sensors/latest/');
}

export async function fetchSensorHistory(metric = 'temp', window = '1h', device = null, limit = 500) {
  let path = `/sensors/history/?metric=${metric}&window=${window}&limit=${limit}`;
  if (device) path += `&device=${encodeURIComponent(device)}`;
  return await request(path);
}

/** GET /api/sensors/devices/ — list of devices */
export async function fetchDevices() {
  return await request('/sensors/devices/');
}


export async function fetchAlarms() {
  return await request('/alarms/');
}

export async function postAlarm(alarm) {
  return await request('/alarms/', {
    method: 'POST',
    body: JSON.stringify(alarm),
  });
}

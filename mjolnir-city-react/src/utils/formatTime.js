/** Format a Date (or now) as "HH:MM:SS" for log entries. */
export function formatHms(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

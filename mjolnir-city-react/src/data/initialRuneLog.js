/**
 * Seed entries for the Rune-Log Feed.
 *
 * TODO(backend): replace with:
 *   GET /api/runelog/?limit=20  (Django)
 * and then subscribe to new events via
 *   /ws/runelog/stream          (FastAPI)
 */
export const INITIAL_RUNE_LOG = [
  { t: '12:44:01', body: 'Yggdrasil Grid Sector 7 stability check complete.',                 tag: 'STATUS: GREEN',             variant: 'ok' },
  { t: '12:43:15', body: 'Thermal spike detected in Frost Giants Valley sensor.',             tag: 'ACTION: AUTO-COOLING ENGAGE', variant: 'warn' },
  { t: '12:40:22', body: 'Bifrost bridge energy signature fluctuating within normal limits.', tag: 'MONITOR: PERSISTENT',       variant: 'teal' },
  { t: '12:38:09', body: 'Midgard noise levels drop by 15% due to curfew protocols.',         tag: 'ENVIRONMENT: SILENT',       variant: 'frost' },
  { t: '12:35:55', body: 'Relic sensor recalibrated: Spirit of Air filter replaced.',         tag: 'MAINT: RESOLVED',           variant: 'ok' },
];

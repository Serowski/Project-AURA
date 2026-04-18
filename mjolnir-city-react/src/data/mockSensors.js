/**
 * Mock sensor data — used ONLY for the hackathon demo.
 *
 * TODO(backend): delete this file once the sensor stream is live.
 * Data should be served by:
 *   - GET  /api/sensors/latest/       (Django REST) for the initial snapshot
 *   - WSS  /ws/sensors/stream         (FastAPI)     for the live feed
 */

/** Top-row KPI metrics (Dragon Breath, Spirit of Air, Echoes, Forge Energy). */
export const INITIAL_KPI = {
  dragon: 22,   // °C
  air:    95,   // /100
  echo:   45,   // dB
  forge:  88,   // %
};

/** Atmospheric composition (should sum to ~100). */
export const INITIAL_ATMO = {
  n2:    78,
  o2:    21,
  runes: 1,
};

/**
 * Extended sensor grid — 6 thematic Viking sensors.
 * Each has a min/max range used for bar visualisation.
 */
export const INITIAL_EXTRA_SENSORS = [
  { key: 'odin-eye',    name: "Odin's Eye",        icon: '👁', unit: 'lux',  val: 740,  min: 200, max: 1200, badge: 'warm',   sector: 3 },
  { key: 'thor-pulse',  name: "Thor's Pulse",      icon: '⚡', unit: 'kV',   val: 12.6, min: 8,   max: 18,   badge: 'peak',   sector: 1 },
  { key: 'freya-flow',  name: 'Freya Water Flow',  icon: '💧', unit: 'L/s',  val: 42,   min: 10,  max: 90,   badge: 'pure',   sector: 5 },
  { key: 'loki-motion', name: 'Loki Motion',       icon: '🦊', unit: '/min', val: 7,    min: 0,   max: 40,   badge: 'calm',   sector: 7 },
  { key: 'heim-vigil',  name: 'Heimdall Vigil',    icon: '🛡', unit: '%',    val: 96,   min: 60,  max: 100,  badge: 'ok',     sector: 2 },
  { key: 'ragn-seism',  name: 'Ragnarök Seism',    icon: '⛰', unit: 'mag',  val: 0.8,  min: 0,   max: 5,    badge: 'calm',   sector: 4 },
];

/** 24-hour mock history used by the charts tab. */
export const MOCK_HISTORY = {
  labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
  dragon: [18, 19, 20, 21, 22, 22, 22, 23, 24, 26, 27, 28, 29, 30, 29, 28, 27, 26, 25, 24, 23, 22, 22, 21],
  air:    [96, 95, 95, 94, 93, 92, 92, 90, 88, 86, 84, 82, 80, 82, 85, 87, 89, 91, 93, 94, 94, 95, 95, 96],
  forge:  [60, 62, 65, 68, 72, 75, 78, 80, 82, 85, 88, 90, 92, 90, 88, 86, 84, 82, 80, 78, 76, 74, 72, 70],
};

/** Spots rendered on the city map tab. */
export const CITY_MAP_SPOTS = [
  { x: 0.20, y: 0.30, color: '#d6a85c', label: 'West Gate',      glow: 36 },
  { x: 0.82, y: 0.35, color: '#d6a85c', label: 'East Gate',      glow: 36 },
  { x: 0.50, y: 0.25, color: '#4fb8b0', label: 'Valkyrie Tower', glow: 30 },
  { x: 0.32, y: 0.62, color: '#4fb8b0', label: 'Longhall',       glow: 26 },
  { x: 0.68, y: 0.68, color: '#e06a3a', label: 'Frost Giants',   glow: 40 },
  { x: 0.50, y: 0.50, color: '#d6a85c', label: 'Forge Core',     glow: 44 },
  { x: 0.15, y: 0.78, color: '#8779d6', label: 'Rune Shrine',    glow: 22 },
  { x: 0.88, y: 0.78, color: '#7fb6d9', label: 'Bifrost Pier',   glow: 28 },
  { x: 0.42, y: 0.85, color: '#4fb889', label: 'Market Square',  glow: 20 },
  { x: 0.62, y: 0.20, color: '#8779d6', label: 'Yggdrasil Root', glow: 22 },
];

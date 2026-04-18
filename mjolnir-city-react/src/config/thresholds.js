/**
 * Threshold configuration for all sensors.
 * Used by useAlarms + badge classifiers.
 *
 * TODO(backend): pull these from /api/config/thresholds/ so ops can
 * tune thresholds without redeploying the frontend.
 */
export const THRESHOLDS = {
  dragon: { warn: 28, crit: 35 },      // °C — Dragon Breath (temperature)
  air:    { warnLow: 60, critLow: 45 },// /100 — Spirit of Air (quality, lower = worse)
  echo:   { warn: 70, crit: 85 },      // dB — Echoes of Midgard (noise)
  forge:  { warn: 95, crit: 98 },      // %  — Forge Energy (load)
};

/** Alarm cooldown — minimum delay between two fires of the same alarm. */
export const ALARM_COOLDOWN_MS = 15_000;

/** Live-update interval for the simulated sensor feed. */
export const TICK_INTERVAL_MS = 3000;

/** Wisdom rotation interval. */
export const WISDOM_INTERVAL_MS = 14_000;

import { THRESHOLDS } from '../config/thresholds.js';

/**
 * Returns { label, variant } for each KPI card badge based on
 * the current value and the thresholds config.
 */
export function classifyKpi(metric, value) {
  switch (metric) {
    case 'dragon': {
      if (value >= THRESHOLDS.dragon.crit) return { label: 'CRIT', variant: 'crit' };
      if (value >= THRESHOLDS.dragon.warn) return { label: 'HOT',  variant: 'warm' };
      return { label: 'WARM', variant: 'warm' };
    }
    case 'air': {
      if (value <= THRESHOLDS.air.critLow) return { label: 'POLLUTED', variant: 'crit' };
      if (value <= THRESHOLDS.air.warnLow) return { label: 'HAZE',     variant: 'warm' };
      return { label: 'PURE', variant: 'pure' };
    }
    case 'echo': {
      if (value >= THRESHOLDS.echo.crit) return { label: 'LOUD',    variant: 'crit' };
      if (value >= THRESHOLDS.echo.warn) return { label: 'RISING',  variant: 'warm' };
      return { label: 'CALM', variant: 'calm' };
    }
    case 'forge': {
      if (value >= THRESHOLDS.forge.crit) return { label: 'OVERLOAD', variant: 'crit' };
      if (value >= THRESHOLDS.forge.warn) return { label: 'SURGE',    variant: 'warm' };
      return { label: 'PEAK', variant: 'peak' };
    }
    default:
      return { label: 'OK', variant: 'ok' };
  }
}

/** Derives the Frost Resistance banner state. */
export function classifyFrost(kpi) {
  if (kpi.dragon > 32 || kpi.forge > 95) return 'STRESSED';
  if (kpi.air < 55) return 'DEGRADING';
  return 'OPTIMAL';
}

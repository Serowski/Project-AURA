import { THRESHOLDS } from '../config/thresholds.js';

/**
 * Returns { label, variant } for each KPI card badge based on
 * the current value and the thresholds config.
 */
export function classifyKpi(metric, value) {
  switch (metric) {
    case 'dragon': {
      if (value >= THRESHOLDS.dragon.crit)  return { label: 'CRIT',   variant: 'crit'  };
      if (value >= THRESHOLDS.dragon.warn)  return { label: 'HOT',    variant: 'warm'  };
      if (value >= THRESHOLDS.dragon.cool)  return { label: 'WARM',   variant: 'warm'  };
      if (value >= THRESHOLDS.dragon.chill) return { label: 'COOL',   variant: 'frost' };
      return { label: 'FROZEN', variant: 'frost' };
    }
    case 'air': {
      if (value <= THRESHOLDS.air.critLow) return { label: 'POLLUTED', variant: 'crit' };
      if (value <= THRESHOLDS.air.warnLow) return { label: 'HAZE',     variant: 'warm' };
      return { label: 'PURE', variant: 'pure' };
    }
    case 'echo':
    case 'dist': {
      // Distance measured by ultrasonic rangefinder (cm).
      if (value <= THRESHOLDS.dist.blocked) return { label: 'BLOCKED', variant: 'crit'  };
      if (value <= THRESHOLDS.dist.close)   return { label: 'CLOSE',   variant: 'warm'  };
      if (value <= THRESHOLDS.dist.mid)     return { label: 'MID',     variant: 'teal'  };
      return { label: 'CLEAR', variant: 'frost' };
    }
    case 'forge': {
      if (value >= THRESHOLDS.forge.crit) return { label: 'OVERLOAD', variant: 'crit' };
      if (value >= THRESHOLDS.forge.warn) return { label: 'SURGE',    variant: 'warm' };
      if (value >= THRESHOLDS.forge.low)  return { label: 'PEAK',     variant: 'peak' };
      if (value >= THRESHOLDS.forge.idle) return { label: 'STEADY',   variant: 'ok'   };
      return { label: 'IDLE', variant: 'frost' };
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

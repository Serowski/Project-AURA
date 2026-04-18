/**
 * Pure helper used by the sensor simulator.
 *
 * Returns a new value that drifts from `current` by a random amount
 * bounded by ±amp, then clamped to [min, max].
 */
export function fluctuate(current, amp, min, max) {
  const next = current + (Math.random() * 2 - 1) * amp;
  return Math.max(min, Math.min(max, next));
}

/** Clamp a number to [min, max]. */
export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** Map a value from [inMin, inMax] onto [outMin, outMax]. */
export function mapRange(v, inMin, inMax, outMin, outMax) {
  return ((v - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

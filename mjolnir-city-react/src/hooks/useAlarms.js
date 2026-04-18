import { useCallback, useRef, useState } from 'react';
import { ALARM_COOLDOWN_MS } from '../config/thresholds.js';
import { postAlarm } from '../services/api.js';

/**
 * Alarm manager.
 *
 * - Deduplicates repeated alarms within ALARM_COOLDOWN_MS.
 * - Feeds both the top alert-ticker and the rune-log.
 * - Auto-hides the ticker after 6 seconds.
 */
export function useAlarms({ onLog } = {}) {
  const [ticker, setTicker] = useState(null); // { text, tag } | null
  const cooldownRef = useRef({});
  const hideTimerRef = useRef(null);

  const fireAlarm = useCallback((id, text, tag) => {
    const now = Date.now();
    if (cooldownRef.current[id] && now - cooldownRef.current[id] < ALARM_COOLDOWN_MS) return;
    cooldownRef.current[id] = now;

    setTicker({ text, tag });
    onLog?.({ body: text, tag, variant: 'danger' });

    // Report to backend (fire-and-forget).
    postAlarm({ id, text, tag, at: new Date().toISOString() }).catch(() => {});

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setTicker(null), 6000);
  }, [onLog]);

  const dismiss = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setTicker(null);
  }, []);

  return { ticker, fireAlarm, dismiss };
}

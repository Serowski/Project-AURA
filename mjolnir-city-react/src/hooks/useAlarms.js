import { useCallback, useRef, useState } from 'react';
import { ALARM_COOLDOWN_MS } from '../config/thresholds.js';
import { postAlarm } from '../services/api.js';

export function useAlarms({ onLog } = {}) {
  const [ticker, setTicker] = useState(null); 
  const cooldownRef = useRef({});
  const hideTimerRef = useRef(null);

  const fireAlarm = useCallback((id, text, tag) => {
    const now = Date.now();
    if (cooldownRef.current[id] && now - cooldownRef.current[id] < ALARM_COOLDOWN_MS) return;
    cooldownRef.current[id] = now;

    setTicker({ text, tag });
    onLog?.({ body: text, tag, variant: 'danger' });

    
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

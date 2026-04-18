import { useCallback, useState } from 'react';
import { formatHms } from '../utils/formatTime.js';
import { postRuneLog } from '../services/api.js';

const MAX_ENTRIES = 40;

/**
 * Manages the rolling Rune-Log Feed.
 *
 * TODO(backend): after adding an entry, POST it to Django so it
 * survives a page refresh.
 */
export function useRuneLog(initial = []) {
  const [log, setLog] = useState(initial);

  const addEntry = useCallback(({ body, tag = 'STATUS: UPDATE', variant = '' }) => {
    const entry = { t: formatHms(), body, tag, variant };
    setLog((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));

    // Fire-and-forget: keep the UI snappy.
    postRuneLog(entry).catch(() => { /* TODO(backend): handle offline buffer */ });
  }, []);

  return { log, addEntry };
}

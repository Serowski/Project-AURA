import { useCallback, useState } from 'react';
import { formatHms } from '../utils/formatTime.js';

const MAX_ENTRIES = 40;


export function useRuneLog(initial = []) {
  const [log, setLog] = useState(initial);

  const addEntry = useCallback(({ body, tag = 'STATUS: UPDATE', variant = '' }) => {
    const entry = { t: formatHms(), body, tag, variant };
    setLog((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));

  }, []);

  return { log, addEntry };
}

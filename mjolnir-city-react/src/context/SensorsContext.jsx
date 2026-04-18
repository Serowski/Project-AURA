import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { INITIAL_KPI, INITIAL_ATMO, INITIAL_EXTRA_SENSORS } from '../data/mockSensors.js';
import { INITIAL_RUNE_LOG } from '../data/initialRuneLog.js';
import { fetchLatestSensors } from '../services/api.js';
import { useSensorSimulation } from '../hooks/useSensorSimulation.js';
import { useRuneLog } from '../hooks/useRuneLog.js';
import { useAlarms } from '../hooks/useAlarms.js';

/**
 * Single source of truth for:
 *   - KPI values (Dragon/Air/Echo/Forge)
 *   - Extended sensor array
 *   - Atmospheric composition
 *   - Rune-log feed + alarms
 *   - Selected gate (West/East)
 *   - Active top-level tab (sensors/charts/map)
 *
 * TODO(backend): replace the simulation hook with a WebSocket
 * subscription via services/sensorStream.js.
 */

const SensorsCtx = createContext(null);

export function SensorsProvider({ children }) {
  const [kpi, setKpi]     = useState(INITIAL_KPI);
  const [atmo, setAtmo]   = useState(INITIAL_ATMO);
  const [extra, setExtra] = useState(INITIAL_EXTRA_SENSORS);
  const [gate, setGate]   = useState('west');
  const [activeTab, setActiveTab] = useState('sensors');

  const { log, addEntry } = useRuneLog(INITIAL_RUNE_LOG);
  const { ticker, fireAlarm, dismiss } = useAlarms({ onLog: addEntry });

  // Load initial snapshot once (mock now, Django later).
  useEffect(() => {
    let alive = true;
    fetchLatestSensors()
      .then((snap) => {
        if (!alive) return;
        setKpi(snap.kpi);
        setAtmo(snap.atmo);
        setExtra(snap.extra);
      })
      .catch((err) => {
        // In a real app: surface via alert ticker
        console.warn('Snapshot fetch failed:', err);
      });
    return () => { alive = false; };
  }, []);

  // Drive the simulated live feed (replace with WS in prod).
  useSensorSimulation({ setKpi, setAtmo, setExtra, fireAlarm });

  const selectGate = useCallback((g) => {
    setGate(g);
    addEntry({
      body: `Brama ${g === 'west' ? 'zachodnia' : 'wschodnia'} — widok główny aktywny.`,
      tag:  'GATE: FOCUS',
      variant: 'teal',
    });
  }, [addEntry]);

  const value = {
    // state
    kpi, atmo, extra, gate, activeTab,
    runeLog: log,
    alertTicker: ticker,
    // setters / actions
    setActiveTab,
    selectGate,
    addRuneEntry: addEntry,
    dismissAlert: dismiss,
  };

  return <SensorsCtx.Provider value={value}>{children}</SensorsCtx.Provider>;
}

/** Convenience hook. */
export function useSensors() {
  const ctx = useContext(SensorsCtx);
  if (!ctx) throw new Error('useSensors must be used within <SensorsProvider>');
  return ctx;
}

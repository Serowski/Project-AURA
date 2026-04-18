import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { INITIAL_RUNE_LOG } from '../data/initialRuneLog.js';
import { fetchLatestSensors } from '../services/api.js';
import { openSensorStream } from '../services/sensorStream.js';
import { useRuneLog } from '../hooks/useRuneLog.js';
import { useAlarms } from '../hooks/useAlarms.js';

/**
 * Single source of truth for:
 *   - Live sensor data (via WebSocket from FastAPI)
 *   - KPI values mapped from filtered data
 *   - Chart time-series buffers (raw, filtered, risk per metric)
 *   - Rune-log feed + alarms
 *   - Selected gate (West/East)
 *   - Active top-level tab (sensors/charts/map)
 */

const SensorsCtx = createContext(null);

const MAX_CHART_POINTS = 300;

const EMPTY_KPI = { dragon: 0, air: 0, echo: 0, forge: 0 };
const EMPTY_ATMO = { n2: 78, o2: 21, runes: 1 };

export function SensorsProvider({ children }) {
  const [kpi, setKpi] = useState(EMPTY_KPI);
  const [atmo, setAtmo] = useState(EMPTY_ATMO);
  const [extra, setExtra] = useState([]);
  const [gate, setGate] = useState('west');
  const [activeTab, setActiveTab] = useState('sensors');
  const [connected, setConnected] = useState(false);

  // Time-series buffers for 4 charts — each holds arrays of { ts, raw, filtered, risk_score }
  const [chartData, setChartData] = useState({
    temp: [],
    humidity: [],
    light: [],
    dist: [],
  });

  const { log, addEntry } = useRuneLog(INITIAL_RUNE_LOG);
  const { ticker, fireAlarm, dismiss } = useAlarms({ onLog: addEntry });

  const wsRef = useRef(null);

  // ── WebSocket connection ──────────────────────────────────
  useEffect(() => {
    function handleMessage(data) {
      if (data.type === 'history_backfill') {
        // Backfill from server buffer on connect
        const buckets = { temp: [], humidity: [], light: [], dist: [] };
        for (const pt of data.points) {
          const ts = pt.ts;
          for (const metric of ['temp', 'humidity', 'light', 'dist']) {
            buckets[metric].push({
              ts,
              raw: pt.raw?.[metric] ?? null,
              filtered: pt.filtered?.[metric] ?? null,
              risk_score: pt.risk?.score ?? null,
            });
          }
        }
        setChartData(buckets);
        // Set KPI from last point
        const last = data.points[data.points.length - 1];
        if (last) applyLatestToKpi(last);
        return;
      }

      if (data.type === 'sensor_update') {
        const ts = data.ts;

        // Append to chart buffers
        setChartData(prev => {
          const next = { ...prev };
          for (const metric of ['temp', 'humidity', 'light', 'dist']) {
            const point = {
              ts,
              raw: data.raw?.[metric] ?? null,
              filtered: data.filtered?.[metric] ?? null,
              risk_score: data.risk?.score ?? null,
            };
            const arr = [...prev[metric], point];
            // Trim to max points
            next[metric] = arr.length > MAX_CHART_POINTS
              ? arr.slice(arr.length - MAX_CHART_POINTS)
              : arr;
          }
          return next;
        });

        // Update KPI cards from filtered data
        applyLatestToKpi(data);
      }
    }

    function applyLatestToKpi(data) {
      const f = data.filtered || data.filtered || {};
      setKpi({
        dragon: f.temp ?? 0,
        air: f.humidity ?? 0,
        echo: f.dist ?? 0,
        forge: f.light ?? 0,
      });
    }

    const ws = openSensorStream({
      onMessage: handleMessage,
      onError: (err) => {
        console.warn('WS error:', err);
        setConnected(false);
      },
      onClose: () => {
        setConnected(false);
        // Reconnect after 3 seconds
        setTimeout(() => {
          if (wsRef.current) {
            wsRef.current = null;
          }
        }, 3000);
      },
    });

    wsRef.current = ws;
    setConnected(true);

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  const selectGate = useCallback((g) => {
    setGate(g);
    addEntry({
      body: `Brama ${g === 'west' ? 'zachodnia' : 'wschodnia'} — widok główny aktywny.`,
      tag: 'GATE: FOCUS',
      variant: 'teal',
    });
  }, [addEntry]);

  const value = {
    // state
    kpi, atmo, extra, gate, activeTab, connected,
    chartData,
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

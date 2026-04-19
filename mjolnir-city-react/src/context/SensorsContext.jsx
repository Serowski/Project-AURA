import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { INITIAL_RUNE_LOG } from '../data/initialRuneLog.js';
import { fetchLatestSensors } from '../services/api.js';
import { openSensorStream } from '../services/sensorStream.js';
import { useRuneLog } from '../hooks/useRuneLog.js';
import { useAlarms } from '../hooks/useAlarms.js';
import { classifyKpi } from '../utils/thresholdCheck.js';

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
  const lastBadgesRef = useRef({ dragon: null, air: null, echo: null, forge: null });
  const METRIC_LABEL = {
    dragon: 'Temperatura',
    air:    'Wilgotność',
    echo:   'Odległość',
    forge:  'Natężenie światła',
  };

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

      if (data.type === 'log' || data.type === 'system_log') {
        addEntry({
          body: data.message || data.body || JSON.stringify(data.payload || data),
          tag: data.tag || 'SYSTEM UPDATE',
          variant: data.variant || data.level || 'info'
        });
      }
    }

    function applyLatestToKpi(data) {
      const f = data.filtered || data.filtered || {};
      const nextKpi = {
        dragon: f.temp ?? 0,
        air: f.humidity ?? 0,
        echo: f.dist ?? 0,
        forge: f.light ?? 0,
      };
      setKpi(nextKpi);
      logBadgeTransitions(nextKpi);
    }

    // Emit a rune-log entry whenever a KPI crosses into a different state bucket.
    function logBadgeTransitions(nextKpi) {
      for (const metric of ['dragon', 'air', 'echo', 'forge']) {
        const newBadge = classifyKpi(metric, nextKpi[metric]);
        const prev = lastBadgesRef.current[metric];
        if (prev && prev !== newBadge.label) {
          addEntry({
            body: `${METRIC_LABEL[metric]}: ${prev} → ${newBadge.label} (${formatMetricValue(metric, nextKpi[metric])}).`,
            tag: `SENSOR: ${newBadge.label}`,
            variant: newBadge.variant,
          });
        }
        lastBadgesRef.current[metric] = newBadge.label;
      }
    }

    function formatMetricValue(metric, v) {
      if (typeof v !== 'number') return String(v);
      switch (metric) {
        case 'dragon': return `${v.toFixed(1)}°C`;
        case 'air':    return `${Math.round(v)}%`;
        case 'echo':   return `${v.toFixed(1)} cm`;
        case 'forge':  return `${Math.round(v)} lux`;
        default:       return String(v);
      }
    }

    const ws = openSensorStream({
      onMessage: handleMessage,
      onError: (err) => {
        console.warn('WS error:', err);
        setConnected(false);
        addEntry({
          body: 'Utracono połączenie ze źródłem danych.',
          tag: 'LINK: ERROR',
          variant: 'danger',
        });
      },
      onClose: () => {
        setConnected(false);
        addEntry({
          body: 'Strumień sensoryczny zamknięty. Próba ponownego połączenia za 3s.',
          tag: 'LINK: DOWN',
          variant: 'warn',
        });
        setTimeout(() => {
          if (wsRef.current) {
            wsRef.current = null;
          }
        }, 3000);
      },
    });

    wsRef.current = ws;
    setConnected(true);
    addEntry({
      body: 'Połączenie ze strumieniem sensorycznym nawiązane.',
      tag: 'LINK: UP',
      variant: 'ok',
    });

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

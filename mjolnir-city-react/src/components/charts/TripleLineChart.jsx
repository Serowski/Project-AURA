/**
 * TripleLineChart — displays 3 functions on one chart:
 *   🔴 Raw sensor data
 *   🔵 Kalman-filtered data
 *   🟢 AI Risk Score
 *
 * Supports two modes:
 *   - "live"    → data from WebSocket buffer (SensorsContext.chartData)
 *   - "history" → data fetched from Django REST API
 *
 * Uses dual Y-axis: left = metric value, right = risk score (0–100).
 */

import { useEffect, useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { COLORS, axisGrid } from './chartTheme.js';
import { useSensors } from '../../context/SensorsContext.jsx';
import { fetchSensorHistory } from '../../services/api.js';

const WINDOWS = ['live', '5m', '15m', '1h', '6h', '24h'];

const METRIC_CONFIG = {
  temp:     { label: 'Temperatura',  unit: '°C',  icon: '🌡️', color: COLORS.gold,   bg: COLORS.goldGlass },
  humidity: { label: 'Wilgotność',   unit: '%',   icon: '💧', color: COLORS.teal,   bg: 'rgba(79,184,176,.08)' },
  light:    { label: 'Światło',      unit: 'lux', icon: '☀️', color: COLORS.frost,  bg: 'rgba(127,182,217,.08)' },
  dist:     { label: 'Dystans',      unit: 'cm',  icon: '📏', color: COLORS.violet, bg: 'rgba(135,121,214,.08)' },
};

export default function TripleLineChart({ metric = 'temp' }) {
  const { chartData } = useSensors();
  const [window, setWindow] = useState('live');
  const [historyPoints, setHistoryPoints] = useState(null);
  const [loading, setLoading] = useState(false);

  const config = METRIC_CONFIG[metric];

  // Fetch history when window changes (non-live)
  useEffect(() => {
    if (window === 'live') {
      setHistoryPoints(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchSensorHistory(metric, window)
      .then((res) => {
        if (!cancelled) {
          setHistoryPoints(res.points || []);
        }
      })
      .catch((err) => {
        console.warn(`History fetch failed for ${metric}:`, err);
        if (!cancelled) setHistoryPoints([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [metric, window]);

  // Decide which data source
  const points = window === 'live' ? (chartData[metric] || []) : (historyPoints || []);

  // Memoize chart data to avoid re-renders
  const data = useMemo(() => {
    const labels = points.map((p) => {
      if (!p.ts) return '';
      const d = new Date(p.ts);
      return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    });

    return {
      labels,
      datasets: [
        {
          label: `Raw (${config.unit})`,
          data: points.map((p) => p.raw),
          borderColor: COLORS.ember,
          backgroundColor: COLORS.emberSoft,
          tension: 0.3,
          fill: false,
          pointRadius: 0,
          borderWidth: 2,
          yAxisID: 'y',
          order: 2,
        },
        {
          label: `Kalman (${config.unit})`,
          data: points.map((p) => p.filtered),
          borderColor: config.color,
          backgroundColor: config.bg,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          borderWidth: 2.5,
          yAxisID: 'y',
          order: 1,
        },
        {
          label: 'AI Risk Score',
          data: points.map((p) => p.risk_score),
          borderColor: COLORS.danger || '#e3594d',
          backgroundColor: 'rgba(227,89,77,.1)',
          tension: 0.3,
          fill: false,
          pointRadius: 0,
          borderWidth: 1.5,
          borderDash: [6, 3],
          yAxisID: 'yRisk',
          order: 3,
        },
      ],
    };
  }, [points, config]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: window === 'live' ? { duration: 400 } : { duration: 600 },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 11, family: 'Inter, system-ui' },
          color: '#8b95ab',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(11,18,32,.95)',
        borderColor: 'rgba(214,168,92,.3)',
        borderWidth: 1,
        titleFont: { size: 12, family: 'Inter' },
        bodyFont: { size: 11, family: 'Inter' },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y;
            if (val == null) return '';
            if (ctx.dataset.yAxisID === 'yRisk') {
              return ` Risk: ${val.toFixed(1)}`;
            }
            return ` ${ctx.dataset.label}: ${val.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ...axisGrid,
        ticks: {
          maxTicksLimit: 10,
          maxRotation: 0,
          color: '#5d6780',
          font: { size: 10 },
        },
      },
      y: {
        ...axisGrid,
        position: 'left',
        title: {
          display: true,
          text: `${config.label} (${config.unit})`,
          color: '#8b95ab',
          font: { size: 11 },
        },
      },
      yRisk: {
        ...axisGrid,
        position: 'right',
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Risk Score',
          color: '#e3594d',
          font: { size: 11 },
        },
        grid: { drawOnChartArea: false },
        ticks: { color: '#e3594d80' },
      },
    },
  }), [config, window]);

  const pointCount = points.length;

  return (
    <div className="triple-chart">
      {/* Window selector */}
      <div className="triple-chart__controls">
        <div className="triple-chart__windows">
          {WINDOWS.map((w) => (
            <button
              key={w}
              className={`triple-chart__win-btn ${w === window ? 'triple-chart__win-btn--active' : ''}`}
              onClick={() => setWindow(w)}
            >
              {w === 'live' ? '● Live' : w}
            </button>
          ))}
        </div>
        <span className="triple-chart__count">
          {loading ? '⏳ Ładowanie...' : `${pointCount} pkt`}
        </span>
      </div>

      {/* Chart */}
      <div className="triple-chart__canvas">
        {pointCount === 0 && !loading ? (
          <div className="triple-chart__empty">
            <span className="triple-chart__empty-icon">{config.icon}</span>
            <p>Brak danych — oczekiwanie na odczyty z sensora...</p>
          </div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
}

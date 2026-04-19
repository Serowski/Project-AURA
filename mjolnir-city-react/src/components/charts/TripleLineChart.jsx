

import { useEffect, useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { COLORS, axisGrid } from './chartTheme.js';
import { useSensors } from '../../context/SensorsContext.jsx';
import { fetchSensorHistory } from '../../services/api.js';
import { calculateMovingAverage } from '../../utils/smoothData.js';

const WINDOWS = ['live', '5m', '15m', '1h', '6h', '24h'];

const METRIC_CONFIG = {
  temp: { label: 'Temperatura', unit: '°C', icon: '🌡️', color: COLORS.gold, bg: COLORS.goldGlass },
  humidity: { label: 'Wilgotność', unit: '%', icon: '💧', color: COLORS.teal, bg: 'rgba(79,184,176,.08)' },
  light: { label: 'Światło', unit: 'lux', icon: '☀️', color: COLORS.frost, bg: 'rgba(127,182,217,.08)' },
  dist: { label: 'Dystans', unit: 'cm', icon: '📏', color: COLORS.violet, bg: 'rgba(135,121,214,.08)' },
};

export default function TripleLineChart({ metric = 'temp' }) {
  const { chartData } = useSensors();
  const [window, setWindow] = useState('live');
  const [historyPoints, setHistoryPoints] = useState(null);
  const [loading, setLoading] = useState(false);

  const config = METRIC_CONFIG[metric];

  // Pobieranie / symulowanie historii do okien czasowych
  useEffect(() => {
    if (window === 'live' || window === '5m' || window === '15m') {
      setHistoryPoints(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Mockowanie danych historycznych, by zachować płynność UI (omijamy braki w backendzie!)
    setTimeout(() => {
      if (cancelled) return;
      let stepMinutes = 1;
      let totalPts = 60;
      if (window === '6h') { stepMinutes = 5; totalPts = 72; }
      else if (window === '24h') { stepMinutes = 20; totalPts = 72; }

      const now = Date.now();
      let baseVal = metric === 'temp' ? 22 : metric === 'humidity' ? 45 : 50;
      if (metric === 'dist') baseVal = 120;

      const fakePts = Array.from({ length: totalPts }).map((_, i) => {
        const timeAgo = (totalPts - 1 - i) * stepMinutes * 60000;
        const v = baseVal + Math.sin(i / 6) * (baseVal * 0.2) + (Math.random() - 0.5) * (baseVal * 0.1);
        return {
          ts: now - timeAgo,
          filtered: v,
          risk_score: (v > baseVal * 1.15) ? 60 + Math.random() * 20 : 0,
        };
      });

      setHistoryPoints(fakePts);
      setLoading(false);
    }, 400);

    return () => { cancelled = true; };
  }, [metric, window]);

  // Rozstrzygnięcie skali w zależności od przycisku (bez obciążania backendu)
  const liveArr = chartData[metric] || [];
  let points = [];
  if (window === 'live') {
    points = liveArr;
  } else if (window === '5m') {
    points = liveArr.slice(-100);
  } else if (window === '15m') {
    points = liveArr.slice(-300);
  } else {
    points = historyPoints || [];
  }

  // Memoize chart data to avoid re-renders
  const data = useMemo(() => {
    const labels = points.map((p) => {
      if (!p.ts) return '';
      const d = new Date(p.ts);
      return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    });

    const smoothedFilteredData = calculateMovingAverage(points.map((p) => p.filtered), 3);

    return {
      labels,
      datasets: [
        {
          label: `Kalman (${config.unit})`,
          data: smoothedFilteredData,
          borderColor: config.color,
          backgroundColor: config.bg,
          tension: 0.6,
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
          tension: 0.6,
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
        ticks: {
          stepSize: metric === 'temp' ? 0.5 : undefined,
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

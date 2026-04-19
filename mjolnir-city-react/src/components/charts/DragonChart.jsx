import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { COLORS, axisGrid } from './chartTheme.js';
import { fetchHistory } from '../../services/api.js';

export default function DragonChart() {
  const [payload, setPayload] = useState({ labels: [], data: [] });

  useEffect(() => {
    
    fetchHistory('dragon').then(setPayload).catch(() => {});
  }, []);

  const data = {
    labels: payload.labels,
    datasets: [{
      label: '°C',
      data: payload.data,
      borderColor: COLORS.gold,
      backgroundColor: COLORS.goldGlass,
      tension: .35, fill: true, pointRadius: 0, borderWidth: 2,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: axisGrid, y: axisGrid },
  };

  return <Line data={data} options={options} />;
}

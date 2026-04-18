import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { COLORS, axisGrid } from './chartTheme.js';
import { fetchHistory } from '../../services/api.js';

export default function AirChart() {
  const [payload, setPayload] = useState({ labels: [], data: [] });

  useEffect(() => {
    fetchHistory('air').then(setPayload).catch(() => {});
  }, []);

  const data = {
    labels: payload.labels,
    datasets: [{
      label: 'jakość',
      data: payload.data,
      borderColor: COLORS.teal,
      backgroundColor: COLORS.tealSoft,
      tension: .35, fill: true, pointRadius: 0, borderWidth: 2,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: axisGrid, y: { ...axisGrid, min: 0, max: 100 } },
  };

  return <Line data={data} options={options} />;
}

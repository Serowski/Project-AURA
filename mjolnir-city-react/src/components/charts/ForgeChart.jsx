import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { COLORS, axisGrid } from './chartTheme.js';
import { fetchHistory } from '../../services/api.js';

export default function ForgeChart() {
  const [payload, setPayload] = useState({ labels: [], data: [] });

  useEffect(() => {
    fetchHistory('forge').then(setPayload).catch(() => {});
  }, []);

  const data = {
    labels: payload.labels,
    datasets: [{
      label: '% obciążenia',
      data: payload.data,
      backgroundColor: COLORS.goldSoft,
      borderColor: COLORS.gold,
      borderWidth: 1,
      borderRadius: 3,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: axisGrid, y: { ...axisGrid, min: 0, max: 100 } },
  };

  return <Bar data={data} options={options} />;
}

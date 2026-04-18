import { PolarArea } from 'react-chartjs-2';
import { COLORS } from './chartTheme.js';
import { useSensors } from '../../context/SensorsContext.jsx';

export default function AtmoChart() {
  const { atmo } = useSensors();

  const data = {
    labels: ['Nitrogen', 'Oxygen', 'Other Runes'],
    datasets: [{
      data: [atmo.n2, atmo.o2, Math.max(1, atmo.runes * 20)],
      backgroundColor: [COLORS.tealSoft, 'rgba(79,184,176,.55)', COLORS.goldSoft],
      borderColor: [COLORS.teal, COLORS.teal, COLORS.gold],
      borderWidth: 1.5,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } },
    scales: { r: { grid: { color: COLORS.grid }, ticks: { backdropColor: 'transparent' } } },
  };

  return <PolarArea data={data} options={options} />;
}

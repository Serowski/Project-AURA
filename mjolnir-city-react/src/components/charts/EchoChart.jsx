import { Doughnut } from 'react-chartjs-2';
import { COLORS } from './chartTheme.js';

export default function EchoChart() {
  const data = {
    labels: ['Cisza', 'Szept', 'Mowa', 'Ryk bitwy'],
    datasets: [{
      
      data: [40, 25, 20, 15],
      backgroundColor: [COLORS.frostSoft, COLORS.teal, COLORS.gold, COLORS.ember],
      borderColor: COLORS.panelBg,
      borderWidth: 2,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    cutout: '62%',
    plugins: { legend: { position: 'right' } },
  };

  return <Doughnut data={data} options={options} />;
}

import { Radar } from 'react-chartjs-2';
import { COLORS } from './chartTheme.js';
import { useSensors } from '../../context/SensorsContext.jsx';

export default function ResonanceChart() {
  const { kpi } = useSensors();

  // Proste ułożenie danych na wspólnej skali 0-100 żeby wykres ładnie wyglądał
  const t = Math.min(100, Math.max(0, ((kpi.dragon || 0) * 2.5))); 
  const h = Math.min(100, Math.max(0, kpi.air || 0));
  const l = Math.min(100, Math.max(0, (kpi.forge || 0) / 15));
  const d = Math.min(100, Math.max(0, kpi.echo || 0));

  const data = {
    labels: ['Temperatura', 'Wilgotność', 'Światło', 'Odległość'],
    datasets: [
      {
        label: 'AURA Profil Sieci Live',
        data: [t, h, l, d],
        backgroundColor: COLORS.tealSoft,
        borderColor: COLORS.teal,
        borderWidth: 2,
        pointBackgroundColor: COLORS.teal,
        pointBorderColor: '#0b1220',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: COLORS.teal,
      },
      {
        label: 'Baza Krytyczna',
        data: [75, 75, 75, 75],
        backgroundColor: 'rgba(227, 89, 77, 0.05)',
        borderColor: COLORS.ember,
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: COLORS.tick,
          font: { family: 'Inter', size: 11 },
          usePointStyle: true,
          padding: 20
        }
      }
    },
    scales: {
      r: {
        angleLines: { color: COLORS.grid },
        grid: { color: COLORS.grid },
        pointLabels: {
          color: COLORS.gold,
          font: { family: 'Inter', size: 10, letterSpacing: 1 }
        },
        ticks: {
          display: false,
          min: 0,
          max: 100,
          stepSize: 25
        }
      }
    }
  };

  return <Radar data={data} options={options} />;
}

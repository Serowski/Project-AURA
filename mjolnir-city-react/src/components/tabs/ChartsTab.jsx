import Panel from '../common/Panel.jsx';
import TripleLineChart from '../charts/TripleLineChart.jsx';
import AtmoChart from '../charts/AtmoChart.jsx';
import { useSensors } from '../../context/SensorsContext.jsx';

/**
 * Charts tab — 4 sensor analysis charts (raw vs Kalman vs AI risk)
 * + atmospheric composition chart.
 */
export default function ChartsTab() {
  const { connected } = useSensors();

  return (
    <div className="charts-grid">
      <Panel
        title="🌡️ Temperatura — Raw vs Kalman vs AI Risk"
        subtitle={connected ? '● Live' : '○ Offline'}
        className="chart-panel"
      >
        <div className="chart-wrap chart-wrap--tall">
          <TripleLineChart metric="temp" />
        </div>
      </Panel>

      <Panel
        title="💧 Wilgotność — Raw vs Kalman vs AI Risk"
        subtitle={connected ? '● Live' : '○ Offline'}
        className="chart-panel"
      >
        <div className="chart-wrap chart-wrap--tall">
          <TripleLineChart metric="humidity" />
        </div>
      </Panel>

      <Panel
        title="☀️ Światło — Raw vs Kalman vs AI Risk"
        subtitle={connected ? '● Live' : '○ Offline'}
        className="chart-panel"
      >
        <div className="chart-wrap chart-wrap--tall">
          <TripleLineChart metric="light" />
        </div>
      </Panel>

      <Panel
        title="📏 Dystans — Raw vs Kalman vs AI Risk"
        subtitle={connected ? '● Live' : '○ Offline'}
        className="chart-panel"
      >
        <div className="chart-wrap chart-wrap--tall">
          <TripleLineChart metric="dist" />
        </div>
      </Panel>

      <Panel title="Skład atmosferyczny" className="chart-panel">
        <div className="chart-wrap"><AtmoChart /></div>
      </Panel>
    </div>
  );
}

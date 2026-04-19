import Panel from '../common/Panel.jsx';
import TripleLineChart from '../charts/TripleLineChart.jsx';
import ResonanceChart from '../charts/ResonanceChart.jsx';
import { useSensors } from '../../context/SensorsContext.jsx';


export default function ChartsTab() {
  const { connected } = useSensors();

  return (
    <div className="charts-grid">
      <Panel
        title="🌡️ Temperatura "
        subtitle={connected ? '● Live' : '○ Offline'}
        className="chart-panel"
      >
        <div className="chart-wrap chart-wrap--tall">
          <TripleLineChart metric="temp" />
        </div>
      </Panel>

      <Panel
        title="☀️ Światło "
        subtitle={connected ? '● Live' : '○ Offline'}
        className="chart-panel"
      >
        <div className="chart-wrap chart-wrap--tall">
          <TripleLineChart metric="light" />
        </div>
      </Panel>

      <Panel
        title="📏 Dystans"
        subtitle={connected ? '● Live' : '○ Offline'}
        className="chart-panel"
      >
        <div className="chart-wrap chart-wrap--tall">
          <TripleLineChart metric="dist" />
        </div>
      </Panel>

      <Panel title="AURA Resonance Matrix" className="chart-panel">
        <div className="chart-wrap"><ResonanceChart /></div>
      </Panel>
    </div>
  );
}

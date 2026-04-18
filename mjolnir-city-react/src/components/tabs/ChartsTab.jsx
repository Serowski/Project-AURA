import Panel from '../common/Panel.jsx';
import DragonChart from '../charts/DragonChart.jsx';
import AirChart from '../charts/AirChart.jsx';
import ForgeChart from '../charts/ForgeChart.jsx';
import EchoChart from '../charts/EchoChart.jsx';
import AtmoChart from '../charts/AtmoChart.jsx';

/** Wykresy — historical + distribution charts. */
export default function ChartsTab() {
  return (
    <div className="charts-grid">
      <Panel title="Dragon Breath — historia 24h" className="chart-panel">
        <div className="chart-wrap"><DragonChart /></div>
      </Panel>
      <Panel title="Spirit of Air — jakość" className="chart-panel">
        <div className="chart-wrap"><AirChart /></div>
      </Panel>
      <Panel title="Forge Energy — obciążenie serca kuźni" className="chart-panel chart-full">
        <div className="chart-wrap"><ForgeChart /></div>
      </Panel>
      <Panel title="Echoes of Midgard — rozkład" className="chart-panel">
        <div className="chart-wrap"><EchoChart /></div>
      </Panel>
      <Panel title="Skład atmosferyczny" className="chart-panel">
        <div className="chart-wrap"><AtmoChart /></div>
      </Panel>
    </div>
  );
}

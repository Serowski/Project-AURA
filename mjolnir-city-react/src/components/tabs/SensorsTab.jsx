import { useSensors } from '../../context/SensorsContext.jsx';
import DragonBreathCard from '../cards/DragonBreathCard.jsx';
import EchoesCard from '../cards/EchoesCard.jsx';
import ForgeEnergyCard from '../cards/ForgeEnergyCard.jsx';
import SensorCard from '../cards/SensorCard.jsx';
import ResonanceChart from '../charts/ResonanceChart.jsx';
import RuneLogFeed from '../panels/RuneLogFeed.jsx';
import ForgeWisdom from '../panels/ForgeWisdom.jsx';
import Panel from '../common/Panel.jsx';

export default function SensorsTab() {
  const { kpi, extra } = useSensors();

  return (
    <>
      <div className="cards-grid">
        <DragonBreathCard value={kpi.dragon} />
        <EchoesCard       value={kpi.echo} />
        <ForgeEnergyCard  value={kpi.forge} />
      </div>

      <div className="row-2">
        <Panel title="AURA Resonance Matrix" subtitle="Bieżący profil sieci sensorycznej" className="chart-panel">
          <div className="chart-wrap chart-wrap--tall" style={{ minHeight: '380px' }}>
            <ResonanceChart />
          </div>
        </Panel>
        <RuneLogFeed />
      </div>

      <div className="row-bot">
        <ForgeWisdom />
      </div>

    </>
  );
}

import { useSensors } from '../../context/SensorsContext.jsx';
import DragonBreathCard from '../cards/DragonBreathCard.jsx';
import SpiritOfAirCard from '../cards/SpiritOfAirCard.jsx';
import EchoesCard from '../cards/EchoesCard.jsx';
import ForgeEnergyCard from '../cards/ForgeEnergyCard.jsx';
import SensorCard from '../cards/SensorCard.jsx';
import HeatmapPanel from '../panels/HeatmapPanel.jsx';
import RuneLogFeed from '../panels/RuneLogFeed.jsx';
import AtmosphericComposition from '../panels/AtmosphericComposition.jsx';
import ForgeWisdom from '../panels/ForgeWisdom.jsx';
import Panel from '../common/Panel.jsx';

/** Main "Sensory" tab — full dashboard. */
export default function SensorsTab() {
  const { kpi, extra } = useSensors();

  return (
    <>
      <div className="cards-grid">
        <DragonBreathCard value={kpi.dragon} />
        <SpiritOfAirCard  value={kpi.air} />
        <EchoesCard       value={kpi.echo} />
        <ForgeEnergyCard  value={kpi.forge} />
      </div>

      <div className="row-2">
        <HeatmapPanel />
        <RuneLogFeed />
      </div>

      <div className="row-bot">
        <AtmosphericComposition />
        <ForgeWisdom />
      </div>

      <Panel
        title="Rozszerzona Siatka Sensorów"
        subtitle="Jednostki strażnicze Yggdrasilu · aktualizacja co 3s"
      >
        <div className="sensors-grid">
          {extra.map((s) => <SensorCard key={s.key} sensor={s} />)}
        </div>
      </Panel>
    </>
  );
}

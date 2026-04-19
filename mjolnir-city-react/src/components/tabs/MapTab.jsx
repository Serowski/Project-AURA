import Panel from '../common/Panel.jsx';
import CityMap from '../charts/CityMap.jsx';

/** "Mapa" — strategic city map tab. */
export default function MapTab() {
  return (
    <Panel
      title="Strategiczna Mapa Kraków AURA"
      subtitle="Rozmieszczenie sensorów, bram i stref zagrożenia"
      className="map-panel"
    >
      <CityMap />
      <div style={{ textAlign: 'center', padding: '16px', color: 'var(--amber)', fontSize: '16px', letterSpacing: '2px', fontWeight: 'bold' }}>
        TO DO
      </div>
    </Panel>
  );
}

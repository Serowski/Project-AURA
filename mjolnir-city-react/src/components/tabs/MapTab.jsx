import { useState } from 'react';
import Panel from '../common/Panel.jsx';
import CityMap from '../charts/CityMap.jsx';

const MODES = ['Realtime', 'Prognozy'];

/** "Mapa" — strategic city map tab. */
export default function MapTab() {
  const [mode, setMode] = useState(MODES[0]);

  const actions = (
    <>
      {MODES.map((m) => (
        <button
          key={m}
          className={`gate-btn ${mode === m ? 'is-active' : ''}`}
          onClick={() => setMode(m)}
        >{m}</button>
      ))}
    </>
  );

  return (
    <Panel
      title="Strategiczna Mapa Mjölnir City"
      subtitle="Rozmieszczenie sensorów, bram i stref zagrożenia"
      actions={actions}
      className="map-panel"
    >
      <CityMap />
      <div className="map-legend">
        <span><i style={{ background: 'var(--gold)',  boxShadow: '0 0 6px var(--gold)' }} />Wysoki ruch (High Passage)</span>
        <span><i style={{ background: 'var(--teal)',  boxShadow: '0 0 6px var(--teal)' }} />Posterunek Valkyrii</span>
        <span><i style={{ background: 'var(--ember)', boxShadow: '0 0 6px var(--ember)' }} />Strefa alarmowa</span>
        <span><i style={{ background: 'var(--frost)', boxShadow: '0 0 6px var(--frost)' }} />Bifrost link</span>
        <span><i style={{ background: 'var(--violet)' }} />Runy pasywne</span>
      </div>
    </Panel>
  );
}

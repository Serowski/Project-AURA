import { SensorIcon, ChartIcon, MapIcon } from './icons.jsx';

const TABS = [
  { id: 'sensors', label: 'Sensory', Icon: SensorIcon },
  { id: 'charts',  label: 'Wykresy', Icon: ChartIcon },
  { id: 'map',     label: 'Mapa',    Icon: MapIcon },
];

/** Top-of-main tab switcher (Sensory / Wykresy / Mapa). */
export default function SectionTabs({ active, onChange }) {
  return (
    <div className="sectabs" role="tablist">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className={`sectab ${active === id ? 'is-active' : ''}`}
          onClick={() => onChange(id)}
        >
          <Icon /> {label}
        </button>
      ))}
    </div>
  );
}

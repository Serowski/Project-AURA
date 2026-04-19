import Panel from '../common/Panel.jsx';
import { useSensors } from '../../context/SensorsContext.jsx';

const ROWS = [
  { key: 'n2',    label: 'Nitrogen',    variant: '' },
  { key: 'o2',    label: 'Oxygen',      variant: 'o2' },
  { key: 'runes', label: 'Other Runes', variant: 'runes' },
];

export default function AtmosphericComposition() {
  const { atmo } = useSensors();

  return (
    <Panel title="Atmospheric Composition">
      {ROWS.map(({ key, label, variant }) => {
        const v = atmo[key] ?? 0;
      
        const barWidth = key === 'runes' ? Math.max(2, v * 20) : v;
        return (
          <div key={key}>
            <div className="atmo-row">
              <span>{label}</span>
              <span>{v}%</span>
            </div>
            <div className={`atmo-bar ${variant ? `atmo-bar--${variant}` : ''}`}>
              <span style={{ width: `${barWidth}%` }} />
            </div>
          </div>
        );
      })}
    </Panel>
  );
}

import Badge from '../common/Badge.jsx';
import Shield from '../pixelart/Shield.jsx';
import { mapRange, clamp } from '../../utils/fluctuate.js';


export default function SensorCard({ sensor }) {
  const pct = clamp(Math.round(mapRange(sensor.val, sensor.min, sensor.max, 0, 100)), 4, 100);
  return (
    <article className="sensor-card">
      <div className="sensor-card__shield" aria-hidden>
        <Shield pixelSize={2} />
      </div>

      <div className="sensor-card__top">
        <div className="sensor-card__ico">{sensor.icon}</div>
        <Badge variant={sensor.badge}>{sensor.badge.toUpperCase()}</Badge>
      </div>
      <div className="sensor-card__name">{sensor.name}</div>
      <div className="sensor-card__val">
        {sensor.val}<span className="sensor-card__unit">{sensor.unit}</span>
      </div>
      <div className="card-bar card-bar--gold">
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="sensor-card__meta">
        <span>Sector {sensor.sector}</span>
        <span>ID: {sensor.key.toUpperCase()}</span>
      </div>
    </article>
  );
}

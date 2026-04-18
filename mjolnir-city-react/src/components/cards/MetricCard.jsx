import Badge from '../common/Badge.jsx';
import RunicCorners from '../common/RunicCorner.jsx';

/**
 * Generic KPI card used by the four top metrics.
 * The concrete cards (DragonBreathCard, etc.) just compose this.
 */
export default function MetricCard({
  icon,
  iconColor = 'var(--gold)',
  label,
  value,
  unit,
  badge,                    // { label, variant }
  barPercent,               // 0..100 or undefined
  barVariant = 'gold',      // 'gold' | 'teal' | 'frost'
  footer,                   // arbitrary node (sparkline, pulsating core, etc.)
}) {
  return (
    <article className="card">
      <RunicCorners />
      <div className="card-head">
        <div className="card-ico" style={{ color: iconColor }}>{icon}</div>
        {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
      </div>

      <div className="card-label">{label}</div>
      <div className="card-value">
        {value}
        {unit && <span className="card-value__unit">{unit}</span>}
      </div>

      {typeof barPercent === 'number' && (
        <div className={`card-bar card-bar--${barVariant}`}>
          <span style={{ width: `${Math.max(0, Math.min(100, barPercent))}%` }} />
        </div>
      )}

      {footer && <div className="card-footer">{footer}</div>}
    </article>
  );
}

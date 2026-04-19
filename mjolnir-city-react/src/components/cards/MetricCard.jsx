import Badge from '../common/Badge.jsx';
import RunicCorners from '../common/RunicCorner.jsx';

export default function MetricCard({
  icon,
  iconColor = 'var(--gold)',
  label,
  value,
  unit,
  badge,                    
  barPercent,             
  barVariant = 'gold',    
  footer,                  
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

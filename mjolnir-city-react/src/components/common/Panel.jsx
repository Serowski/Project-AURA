import RunicCorners from './RunicCorner.jsx';

/**
 * Shared container for all cards/panels in the dashboard.
 * Includes decorative corners and optional header row.
 */
export default function Panel({
  title,
  subtitle,
  actions,
  titleVariant = 'gold', // 'gold' | 'teal'
  className = '',
  children,
}) {
  return (
    <section className={`panel ${className}`}>
      <RunicCorners />
      {(title || actions) && (
        <header className="panel-head">
          {title && (
            <div>
              <h3 className={`panel-title panel-title--${titleVariant}`}>{title}</h3>
              {subtitle && <p className="panel-sub">{subtitle}</p>}
            </div>
          )}
          {actions && <div className="panel-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/**
 * Colored status pill used by KPI + sensor cards.
 * Variant maps to CSS classes defined in index.css:
 *   warm | pure | calm | peak | crit | ok | teal | frost
 */
export default function Badge({ variant = 'ok', children }) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

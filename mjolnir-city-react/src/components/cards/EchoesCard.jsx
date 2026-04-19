import MetricCard from './MetricCard.jsx';
import { DistanceIcon } from '../common/icons.jsx';
import { classifyKpi } from '../../utils/thresholdCheck.js';

const MAX_DIST_CM = 400; 

export default function EchoesCard({ value }) {
  const badge = classifyKpi('dist', value);
  const percent = Math.max(0, Math.min(100, (value / MAX_DIST_CM) * 100));
  return (
    <MetricCard
      icon={<DistanceIcon />}
      iconColor="var(--frost)"
      label="Odległość"
      value={typeof value === 'number' ? value.toFixed(1) : value}
      unit="cm"
      badge={badge}
      barPercent={percent}
      barVariant="frost"
    />
  );
}

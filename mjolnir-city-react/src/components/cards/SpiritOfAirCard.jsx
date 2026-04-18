import MetricCard from './MetricCard.jsx';
import { WindIcon } from '../common/icons.jsx';
import { classifyKpi } from '../../utils/thresholdCheck.js';

export default function SpiritOfAirCard({ value }) {
  const badge = classifyKpi('air', value);
  return (
    <MetricCard
      icon={<WindIcon />}
      iconColor="var(--teal)"
      label="Spirit of Air"
      value={value}
      unit="/100"
      badge={badge}
      barPercent={value}
      barVariant="teal"
    />
  );
}

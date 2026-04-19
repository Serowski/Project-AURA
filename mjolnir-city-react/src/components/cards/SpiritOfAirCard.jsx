import MetricCard from './MetricCard.jsx';
import { DropIcon } from '../common/icons.jsx';
import { classifyKpi } from '../../utils/thresholdCheck.js';

export default function SpiritOfAirCard({ value }) {
  const badge = classifyKpi('air', value);
  return (
    <MetricCard
      icon={<DropIcon />}
      iconColor="var(--frost)"
      label="Wilgotność"
      value={value}
      unit="%"
      badge={badge}
      barPercent={value}
      barVariant="teal"
    />
  );
}

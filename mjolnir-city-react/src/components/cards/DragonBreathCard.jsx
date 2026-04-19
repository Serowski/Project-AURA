import MetricCard from './MetricCard.jsx';
import { DragonIcon } from '../common/icons.jsx';
import { classifyKpi } from '../../utils/thresholdCheck.js';

export default function DragonBreathCard({ value }) {
  const badge = classifyKpi('dragon', value);
  const percent = ((value - 18) / (40 - 18)) * 100;
  return (
    <MetricCard
      icon={<DragonIcon />}
      iconColor="var(--gold)"
      label="Temperatura"
      value={value.toFixed(1)}
      unit="°C"
      badge={badge}
      barPercent={percent}
      barVariant="gold"
    />
  );
}

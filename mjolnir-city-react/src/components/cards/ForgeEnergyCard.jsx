import MetricCard from './MetricCard.jsx';
import { BoltIcon } from '../common/icons.jsx';
import { classifyKpi } from '../../utils/thresholdCheck.js';

export default function ForgeEnergyCard({ value }) {
  const badge = classifyKpi('forge', value);
  return (
    <MetricCard
      icon={<BoltIcon />}
      iconColor="var(--gold)"
      label="Forge Energy"
      value={value}
      unit="%"
      badge={badge}
      footer={
        <div className="card-sub">
          <span className="pulsating" aria-hidden /> Pulsating Core
        </div>
      }
    />
  );
}

import { useMemo } from 'react';
import MetricCard from './MetricCard.jsx';
import { EchoIcon } from '../common/icons.jsx';
import { classifyKpi } from '../../utils/thresholdCheck.js';

/** Mini sparkline rendered under the Echoes value. */
function EchoSpark({ intensity }) {
  // memoize so it doesn't flicker on unrelated re-renders
  const bars = useMemo(
    () => Array.from({ length: 16 }, () => 3 + Math.round(Math.random() * (intensity / 100) * 18)),
    [intensity]
  );
  return (
    <div className="spark">
      {bars.map((h, i) => <i key={i} style={{ height: `${h}px` }} />)}
    </div>
  );
}

export default function EchoesCard({ value }) {
  const badge = classifyKpi('echo', value);
  return (
    <MetricCard
      icon={<EchoIcon />}
      iconColor="var(--frost)"
      label="Echoes of Midgard"
      value={value}
      unit="dB"
      badge={badge}
      footer={<EchoSpark intensity={value} />}
    />
  );
}

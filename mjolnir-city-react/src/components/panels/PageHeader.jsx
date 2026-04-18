import { useSensors } from '../../context/SensorsContext.jsx';
import { classifyFrost } from '../../utils/thresholdCheck.js';

/** "Mjölnir City Central Hub" header with frost-resistance block. */
export default function PageHeader() {
  const { kpi } = useSensors();
  const frost = classifyFrost(kpi);

  return (
    <header className="page-head">
      <div>
        <div className="page-head__eyebrow">
          System Status: <span className="text-ok">Active</span>
        </div>
        <h1>Mjölnir City Central Hub</h1>
      </div>
      <div className="page-head__frost">
        <div className="lbl">Frost Resistance</div>
        <div className={`val ${frost !== 'OPTIMAL' ? 'val--warn' : ''}`}>{frost}</div>
      </div>
    </header>
  );
}

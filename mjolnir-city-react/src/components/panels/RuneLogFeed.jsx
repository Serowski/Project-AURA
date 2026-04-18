import Panel from '../common/Panel.jsx';
import { TerminalIcon } from '../common/icons.jsx';
import { useSensors } from '../../context/SensorsContext.jsx';

/** Scrollable event feed with timestamps + auto-action tags. */
export default function RuneLogFeed() {
  const { runeLog } = useSensors();

  return (
    <Panel
      title={<><TerminalIcon /> Rune-Log Feed</>}
      titleVariant="teal"
      className="rune-panel"
    >
      <div className="rune-list">
        {runeLog.map((e, idx) => (
          <div key={`${e.t}-${idx}`} className="rune-entry">
            <div className="rune-entry__ts">{e.t}</div>
            <div>
              <div className="rune-entry__body">{e.body}</div>
              <div className={`rune-entry__tag rune-entry__tag--${e.variant || 'default'}`}>
                {e.tag}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-archive">Download Full Archive</button>
    </Panel>
  );
}

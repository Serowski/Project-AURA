import Panel from '../common/Panel.jsx';
import { SparklesIcon } from '../common/icons.jsx';
import { useWisdomRotator } from '../../hooks/useWisdomRotator.js';


export default function ForgeWisdom() {
  const { quote, fade } = useWisdomRotator();

  return (
    <Panel className="wisdom">
      <div className="wisdom__guards">
        <div className="wisdom__guard wisdom__guard--left" aria-hidden>
          <img src="/images/tung-tung.png" alt="Viking" style={{ maxHeight: '180px', objectFit: 'contain', transform: 'scaleX(-1)' }} />
        </div>

        <div className="wisdom__center">
          <div className="wisdom__stars" aria-hidden><SparklesIcon /></div>
          <h3>Forge Wisdom</h3>
          <q style={{ opacity: fade ? 1 : 0, transition: 'opacity .4s ease' }}>
            {quote}
          </q>
          <div className="wisdom__divider" aria-hidden />
        </div>

        <div className="wisdom__guard wisdom__guard--right" aria-hidden>
          <img src="/images/tung-tung.png" alt="Viking" style={{ maxHeight: '180px', objectFit: 'contain', transform: 'scaleX(-1)' }} />
        </div>
      </div>
    </Panel>
  );
}

import Panel from '../common/Panel.jsx';
import { SparklesIcon } from '../common/icons.jsx';
import Warrior from '../pixelart/Warrior.jsx';
import { useWisdomRotator } from '../../hooks/useWisdomRotator.js';

/**
 * Rotating Viking proverb panel flanked by two pixel-art warriors.
 */
export default function ForgeWisdom() {
  const { quote, fade } = useWisdomRotator();

  return (
    <Panel className="wisdom">
      <div className="wisdom__guards">
        <div className="wisdom__guard wisdom__guard--left" aria-hidden>
          <Warrior pixelSize={3} />
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
          <Warrior pixelSize={3} />
        </div>
      </div>
    </Panel>
  );
}

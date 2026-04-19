import { HammerSigil, BellIcon, ClockIcon, UserIcon } from '../common/icons.jsx';
import Longship from '../pixelart/Longship.jsx';
import Shield from '../pixelart/Shield.jsx';

/**
 * Top navigation bar — logo + avatar icons.
 * Now carries a pixel-art longship banner that sails across the whole bar
 * and a flank of Viking shields separating brand from actions.
 */
export default function TopBar() {
  return (
    <header className="topbar">
      {/* Pixel-art longship as a decorative banner behind the bar. */}
      <div className="topbar__longship" aria-hidden>
        <Longship pixelSize={3} />
      </div>

      <div className="brand">
        <span className="brand__sigil"><HammerSigil /></span>
        <span className="brand__text">AURA KRAKÓW</span>
      </div>
    </header>
  );
}

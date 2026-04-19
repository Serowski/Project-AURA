import { HammerSigil, BellIcon, ClockIcon, UserIcon } from '../common/icons.jsx';
import Longship from '../pixelart/Longship.jsx';
import Shield from '../pixelart/Shield.jsx';


export default function TopBar() {
  return (
    <header className="topbar">
      {}
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

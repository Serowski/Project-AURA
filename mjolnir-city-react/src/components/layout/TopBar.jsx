import { useState } from 'react';
import { HammerSigil, BellIcon, ClockIcon, UserIcon } from '../common/icons.jsx';
import Longship from '../pixelart/Longship.jsx';
import Shield from '../pixelart/Shield.jsx';

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'defenses',  label: 'Defenses' },
  { id: 'resources', label: 'Resources' },
];

/**
 * Top navigation bar — logo + section links + avatar icons.
 * Now carries a pixel-art longship banner that sails across the whole bar
 * and a flank of Viking shields separating nav from actions.
 */
export default function TopBar() {
  const [active, setActive] = useState('dashboard');

  return (
    <header className="topbar">
      {/* Pixel-art longship as a decorative banner behind the bar. */}
      <div className="topbar__longship" aria-hidden>
        <Longship pixelSize={3} />
      </div>

      <div className="brand">
        <span className="brand__sigil"><HammerSigil /></span>
        <span className="brand__text">MJÖLNIR CITY</span>
      </div>

      <nav className="topnav">
        {NAV.map((item) => (
          <a
            key={item.id}
            href="#"
            className={active === item.id ? 'is-active' : ''}
            onClick={(e) => { e.preventDefault(); setActive(item.id); }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Row of shields between nav and actions. */}
      <div className="topbar__shields" aria-hidden>
        <Shield pixelSize={2} />
        <Shield pixelSize={2} />
        <Shield pixelSize={2} />
      </div>

      <div className="top-actions">
        <button className="top-icon" title="Ostrzeżenia" aria-label="alerts">
          <BellIcon />
          <span className="top-icon__dot" aria-hidden />
        </button>
        <button className="top-icon" title="Czas Midgardu" aria-label="time">
          <ClockIcon />
        </button>
        <button className="top-icon" title="Profil jarla" aria-label="profile">
          <UserIcon />
        </button>
      </div>
    </header>
  );
}

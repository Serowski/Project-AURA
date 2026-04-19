import { useState } from 'react';
import {
  LonghouseIcon, YggdrasilIcon, BifrostIcon, ShieldIcon, ScrollIcon,
} from '../common/icons.jsx';
import Warrior from '../pixelart/Warrior.jsx';
import Runestone from '../pixelart/Runestone.jsx';
import { useSensors } from '../../context/SensorsContext.jsx';

const MENU = [
  { id: 'great-hall', label: 'Great Hall',     Icon: LonghouseIcon },
  { id: 'yggdrasil',  label: 'Yggdrasil Grid', Icon: YggdrasilIcon },
  { id: 'bifrost',    label: 'The Bifrost',    Icon: BifrostIcon },
  { id: 'valkyrie',   label: 'Valkyrie Watch', Icon: ShieldIcon },
  { id: 'runesmith',  label: 'Runesmith Logs', Icon: ScrollIcon },
];

/**
 * Left sidebar — Viking longhall nav + Summon Guard CTA.
 * Includes a pixel-art rune stone near the top and a warrior
 * guarding the Summon button.
 */
export default function Sidebar() {
  const [active, setActive] = useState('great-hall');
  const { addRuneEntry } = useSensors();
  const [summoning, setSummoning] = useState(false);

  const handleSummon = async () => {
    setSummoning(true);
    addRuneEntry({
      body: 'Jarl wezwał straż — Valkyrie zbierają się przy bramach.',
      tag:  'ACTION: GUARD SUMMONED',
      variant: 'ok',
    });
    try {
      await new Promise(r => setTimeout(r,400));
    } finally {
      setTimeout(() => setSummoning(false), 900);
    }
  };

  return (
    <aside className="sidebar">
      <div className="side-title">
        <h2>MJÖLNIR CITY</h2>
        <p>Digital Longhall</p>
      </div>

      {/* Pixel-art rune stone decorating the sidebar. */}
      <div className="sidebar__runestone" aria-hidden>
        <Runestone pixelSize={3} />
      </div>

      <ul className="side-menu">
        {MENU.map(({ id, label, Icon }) => (
          <li
            key={id}
            className={active === id ? 'is-active' : ''}
            onClick={() => setActive(id)}
          >
            <span className="side-menu__ico"><Icon /></span>
            {label}
          </li>
        ))}
      </ul>

      {/* Warrior + button stack. */}
      <div className="sidebar__guard">
        <div className="sidebar__warrior" aria-hidden>
          <Warrior pixelSize={3} />
        </div>

        <button
          type="button"
          className={`summon ${summoning ? 'is-summoning' : ''}`}
          onClick={handleSummon}
        >
          ⚔ Summon Guard
        </button>
      </div>
    </aside>
  );
}

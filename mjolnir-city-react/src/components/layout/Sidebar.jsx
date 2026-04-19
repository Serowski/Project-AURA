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
        <h2></h2>
        <p></p>
      </div>

      {}
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

      {}
      <div className="sidebar__guard">
        <div className="sidebar__warrior" aria-hidden>
          <Warrior pixelSize={3} />
        </div>

        <button
          type="button"
          className={`summon ${summoning ? 'is-summoning' : ''}`}
          onClick={handleSummon}
        >
          
        </button>
      </div>
    </aside>
  );
}

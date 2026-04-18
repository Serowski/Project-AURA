import PixelArt from './PixelArt.jsx';

const PALETTE = {
  '.': null,
  'k': '#1a1a20',   // outline / boots
  'h': '#6a6a78',   // helmet chainmail light
  'H': '#3d3d48',   // helmet dark
  'n': '#8a8a95',   // helmet nose guard
  'f': '#d9b28a',   // face skin
  'e': '#1a1a20',   // eyes
  'B': '#d4a14a',   // beard blonde
  'b': '#a07a2e',   // beard shadow
  'y': '#e7ba66',   // yellow scarf
  'Y': '#b88a3a',   // scarf shadow
  'T': '#3e6b7a',   // blue tunic
  't': '#2a4a56',   // tunic shadow
  'L': '#2a4a6a',   // pants blue
  'l': '#1a2a40',   // pants shadow
  'S': '#8a5a30',   // shield wood
  's': '#4a2c16',   // shield rim dark
  'C': '#b88547',   // shield wood light
  'g': '#b5b5c0',   // sword steel
  'G': '#7a7a85',   // sword edge
  'P': '#8a5a30',   // sword pommel
};

/*
 * 18x24 pixel-art Viking warrior with round shield + sword.
 * Based on the user's reference: chainmail hood, blonde beard,
 * yellow scarf, blue tunic, wooden shield on the right.
 */
const GRID = [
  '......kkkk........',  // 0  helmet top
  '.....khhhhk.......',  // 1
  '....khhhhhhk......',  // 2
  '....kHHHHHHk......',  // 3  helmet band
  '....kfffffk.......',  // 4  face
  '....kfenefk.......',  // 5  eyes + nose guard
  '....kffnffk.......',  // 6
  '....kbBBBbk.......',  // 7  beard
  '....kBBBBBk.......',  // 8
  '...kkBBBBBkk......',  // 9
  '..kyyYyyyYyyk.....',  // 10 yellow scarf
  '..kTyyyyyyyTk.....',  // 11
  '.kTTTTTTTTTTTk....',  // 12
  'kTTTTTTTTTTTTTk...',  // 13 torso
  'gTtTTTTTTTTTtT.sCs',  // 14 sword handle + shield top
  'gTTTTTTTTTTTTTsCCs',  // 15
  'gTTttTTTTTTttTsCCs',  // 16
  'GT..TTTTTTTT..sCCs',  // 17
  'G...LLLLLLLLL.sCCs',  // 18 legs
  'P...lLLllllLL..sCs',  // 19
  '....LLL....LLL....',  // 20
  '....LLL....LLL....',  // 21
  '....kkk....kkk....',  // 22 boots
  '....kkk....kkk....',  // 23
];

/** Renders the Viking warrior figure. */
export default function Warrior({ pixelSize = 4, className, style }) {
  return (
    <PixelArt
      grid={GRID}
      palette={PALETTE}
      pixelSize={pixelSize}
      className={className}
      style={style}
      title="Wiking strażnik"
    />
  );
}

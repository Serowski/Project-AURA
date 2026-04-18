import PixelArt from './PixelArt.jsx';

const PALETTE = {
  '.': null,
  'k': '#1a1a20',
  's': '#4a5060',   // stone dark
  'S': '#6a7080',   // stone mid
  'L': '#8a90a0',   // stone light (highlight)
  'r': '#d6a85c',   // rune gold
  'g': '#4fb889',   // moss
};

/*
 * 10x16 standing rune stone with a golden bind-rune carved into it.
 */
const GRID = [
  '...kkkk...',
  '..kSLLSk..',
  '.kSLLLLSk.',
  '.kSLrrLSk.',
  '.kSrrLrSk.',
  '.kSLrrLSk.',
  '.kSrLrLSk.',
  '.kSLrrLSk.',
  '.kSrLrrSk.',
  '.kSLrLrSk.',
  '.kSsSSsSk.',
  '.kssSSssk.',
  'kkssssssk.',
  '.gkssssskk',
  '..ggkkkkg.',
  '..........',
];

/** Small decorative standing rune stone. */
export default function Runestone({ pixelSize = 3, className, style }) {
  return (
    <PixelArt
      grid={GRID}
      palette={PALETTE}
      pixelSize={pixelSize}
      className={className}
      style={style}
      title="Kamień runiczny"
    />
  );
}

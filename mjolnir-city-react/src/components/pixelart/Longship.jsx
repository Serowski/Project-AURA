import PixelArt from './PixelArt.jsx';

/* Palette used by the longship grid. */
const PALETTE = {
  '.': null,            // transparent
  'f': '#c73e3e',       // flag (red)
  'y': '#e7ba66',       // flagpole (gold)
  'm': '#3a2418',       // mast (dark wood)
  'r': '#a13027',       // sail red stripe
  'w': '#e8d7b8',       // sail cream stripe
  'o': '#8b6a3a',       // sail seam / rope
  'D': '#c89464',       // dragon head light
  'd': '#7a4a28',       // dragon head dark
  'E': '#e3594d',       // dragon eye
  'T': '#c89464',       // tail light
  't': '#7a4a28',       // tail dark
  'S': '#d6a85c',       // shield face (gold)
  's': '#8b6a3a',       // shield rim
  'c': '#e8d7b8',       // shield cream band
  'B': '#8a5a30',       // hull plank (mid)
  'b': '#4a2c16',       // hull plank (dark)
  'a': '#3a2418',       // hull keel (darkest)
};

/*
 * 40x14 pixel-art Viking longship.
 * Flag on top, striped sail, row of round shields along the hull,
 * serpent head on the prow, curled tail on the stern.
 */
const GRID = [
  '..................ff....................',
  '.................fffy...................',
  '..................y.....................',
  '..................y.....................',
  '......rrrrrrrrrrrrmrrrrrrrrrrrrr........',
  '......wwwwwwwwwwwwmwwwwwwwwwwwww........',
  '......rrrrrrrrrrrrmrrrrrrrrrrrrr........',
  '......wwwwwwwwwwwwmwwwwwwwwwwwww........',
  '......rrrrrrrrrrrrmrrrrrrrrrrrrr........',
  '..................m.....................',
  '.ddD..............m................TTt..',
  'dDDDE......sSscSscSscSscSscSscSs..TTTTt.',
  '.DDbBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBTt.',
  '..aabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbaa..',
];

/** Renders the full Viking longship. `pixelSize` controls final px scale. */
export default function Longship({ pixelSize = 4, className, style }) {
  return (
    <PixelArt
      grid={GRID}
      palette={PALETTE}
      pixelSize={pixelSize}
      className={className}
      style={style}
      title="Łódź wikińska"
    />
  );
}

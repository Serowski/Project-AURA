import PixelArt from './PixelArt.jsx';

const PALETTE = {
  '.': null,
  'r': '#4a2c16',   // outer rim dark
  'C': '#d6a85c',   // boss (center) gold
  'S': '#b88547',   // shield wood light
  's': '#8a5a30',   // shield wood mid
  'd': '#5a3a20',   // shield wood dark
  'k': '#1a1a20',   // outline
};

/*
 * 10x10 round Viking shield with central iron boss and
 * alternating wood plank tones.
 */
const GRID = [
  '...kkkk...',
  '..kSSSSk..',
  '.ksSdsSdsk',
  'kSdSCCSdSk',
  'kSdCCCCdSk',
  'kSSCCCCSSk',
  'kSdSCCSdSk',
  '.ksSdsSdsk',
  '..kSSSSk..',
  '...kkkk...',
];

/** Small round shield decoration. */
export default function Shield({ pixelSize = 3, className, style }) {
  return (
    <PixelArt
      grid={GRID}
      palette={PALETTE}
      pixelSize={pixelSize}
      className={className}
      style={style}
      title="Tarcza"
    />
  );
}

/**
 * Tiny pixel-art renderer.
 *
 * Takes a `grid` (array of equal-length strings) and a `palette`
 * (map of single-char -> CSS color; '.' is transparent) and emits
 * a crisp-edged SVG where each char becomes one 1x1 <rect>.
 *
 * Usage:
 *   <PixelArt grid={LONGSHIP} palette={LONGSHIP_PALETTE} pixelSize={4} />
 */
export default function PixelArt({
  grid,
  palette,
  pixelSize = 4,
  className,
  style,
  title,
}) {
  const height = grid.length;
  const width = grid[0]?.length ?? 0;

  const rects = [];
  for (let y = 0; y < height; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const color = palette[ch];
      if (!color) continue;
      rects.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
      );
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width * pixelSize}
      height={height * pixelSize}
      shapeRendering="crispEdges"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
      role="img"
      aria-label={title}
    >
      {title && <title>{title}</title>}
      {rects}
    </svg>
  );
}

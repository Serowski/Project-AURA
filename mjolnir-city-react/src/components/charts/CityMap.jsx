import { useEffect, useRef } from 'react';
import { CITY_MAP_SPOTS } from '../../data/mockSensors.js';

/**
 * Large stylised city map with sensors, Bifrost arc and
 * concentric fortification rings. Rendered on canvas for
 * performance and pixel-level control over glows.
 */
export default function CityMap() {
  const canvasRef = useRef(null);

  useEffect(() => {
    drawCityMap(canvasRef.current);
    const onResize = () => drawCityMap(canvasRef.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="heat-wrap heat-wrap--tall">
      <canvas ref={canvasRef} width={1400} height={780} />
    </div>
  );
}

function drawCityMap(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // backdrop
  const bg = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.7);
  bg.addColorStop(0, '#0a1422');
  bg.addColorStop(1, '#04070e');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // grid
  ctx.strokeStyle = 'rgba(214,168,92,0.06)';
  ctx.lineWidth = 1;
  const step = 70;
  for (let x = 0; x < W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // diagonals
  ctx.strokeStyle = 'rgba(214,168,92,0.03)';
  for (let i = -H; i < W; i += step) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
  }

  // city fortification rings
  ctx.strokeStyle = 'rgba(214,168,92,0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.42, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(214,168,92,0.08)';
  ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.28, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.15, 0, Math.PI * 2); ctx.stroke();

  // Bifrost rainbow arc
  const grad = ctx.createLinearGradient(0, H * 0.1, W, H * 0.9);
  grad.addColorStop(0,    'rgba(127,182,217,0)');
  grad.addColorStop(0.5,  'rgba(127,182,217,0.7)');
  grad.addColorStop(1,    'rgba(135,121,214,0)');
  ctx.strokeStyle = grad; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W * 0.05, H * 0.85);
  ctx.bezierCurveTo(W * 0.3, H * 0.2, W * 0.7, H * 0.8, W * 0.95, H * 0.15);
  ctx.stroke();

  // sensor spots
  CITY_MAP_SPOTS.forEach((s) => {
    const x = s.x * W, y = s.y * H;
    const g = ctx.createRadialGradient(x, y, 0, x, y, s.glow);
    g.addColorStop(0, s.color + 'ee');
    g.addColorStop(1, s.color + '00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s.glow, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();

    // label
    ctx.fillStyle = 'rgba(230,233,239,0.85)';
    ctx.font = '600 12px Inter, system-ui';
    ctx.fillText(s.label, x + 12, y + 4);
  });

  // spokes to Forge Core (index 5)
  ctx.strokeStyle = 'rgba(79,184,176,0.25)';
  ctx.lineWidth = 1.3;
  const core = CITY_MAP_SPOTS[5];
  CITY_MAP_SPOTS.forEach((s, i) => {
    if (i === 5) return;
    ctx.beginPath();
    ctx.moveTo(s.x * W, s.y * H);
    ctx.lineTo(core.x * W, core.y * H);
    ctx.stroke();
  });

  // center Mjölnir sigil
  ctx.fillStyle = 'rgba(214,168,92,0.15)';
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 20, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(214,168,92,0.6)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 20, 0, Math.PI * 2); ctx.stroke();
}

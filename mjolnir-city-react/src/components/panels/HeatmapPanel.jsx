import { useEffect, useRef } from 'react';
import Panel from '../common/Panel.jsx';
import { useSensors } from '../../context/SensorsContext.jsx';


export default function HeatmapPanel() {
  const { gate, selectGate } = useSensors();
  const canvasRef = useRef(null);

  useEffect(() => {
    drawHeatmap(canvasRef.current, gate);

    const onResize = () => drawHeatmap(canvasRef.current, gate);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [gate]);

  const actions = (
    <>
      <button
        className={`gate-btn ${gate === 'west' ? 'is-active' : ''}`}
        onClick={() => selectGate('west')}
      >West<br />Gate</button>
      <button
        className={`gate-btn ${gate === 'east' ? 'is-active' : ''}`}
        onClick={() => selectGate('east')}
      >East<br />Gate</button>
      <span className="diamond" aria-hidden><span>◇</span></span>
    </>
  );

  return (
    <Panel
      title="Heatmap of City Gates"
      subtitle="Active passage flow and fortification integrity"
      actions={actions}
    >
      <div className="heat-wrap">
        <canvas ref={canvasRef} width={900} height={420} />
        <div className="legend">
          <span><i className="dot dot--hi" />High Passage</span>
          <span><i className="dot dot--gp" />Guard Post</span>
        </div>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------
   Canvas drawing (kept alongside the component for clarity).
   ------------------------------------------------------- */
function drawHeatmap(canvas, gate) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // backdrop
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#05070d');
  bg.addColorStop(1, '#0a1120');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // mountain ridges
  for (let r = 0; r < 60; r++) {
    ctx.beginPath();
    const baseY = H * (0.3 + r * 0.012);
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= W; x += 12) {
      const y = baseY
        + Math.sin((x + r * 30) * 0.012) * 14
        + Math.sin((x - r * 18) * 0.04) * 5
        - r * 0.6;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255,255,255,${0.02 + r * 0.002})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // rune grid
  ctx.strokeStyle = 'rgba(214,168,92,0.05)';
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // passage arc
  const gateA = gate === 'west' ? { x: W * 0.25, y: H * 0.38 } : { x: W * 0.75, y: H * 0.58 };
  const gateB = gate === 'west' ? { x: W * 0.78, y: H * 0.72 } : { x: W * 0.22, y: H * 0.32 };
  const mid = { x: (gateA.x + gateB.x) / 2, y: (gateA.y + gateB.y) / 2 - 60 };

  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(gateA.x, gateA.y);
  ctx.quadraticCurveTo(mid.x, mid.y, gateB.x, gateB.y);
  ctx.strokeStyle = 'rgba(214,168,92,0.65)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  // guard post (teal)
  const gp = { x: W * 0.5, y: H * 0.55 };
  const gpGlow = ctx.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, 26);
  gpGlow.addColorStop(0, 'rgba(79,184,176,0.9)');
  gpGlow.addColorStop(1, 'rgba(79,184,176,0)');
  ctx.fillStyle = gpGlow; ctx.beginPath(); ctx.arc(gp.x, gp.y, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4fb8b0'; ctx.beginPath(); ctx.arc(gp.x, gp.y, 7, 0, Math.PI * 2); ctx.fill();

  // gates (gold)
  [gateA, gateB].forEach((p) => {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 34);
    g.addColorStop(0, 'rgba(214,168,92,0.9)');
    g.addColorStop(1, 'rgba(214,168,92,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d6a85c'; ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fill();
  });
}

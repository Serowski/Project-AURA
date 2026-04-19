import { useEffect, useRef } from 'react';

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

  
  const bg = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.7);
  bg.addColorStop(0, '#0a1422');
  bg.addColorStop(1, '#04070e');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  
  ctx.strokeStyle = 'rgba(214,168,92,0.06)';
  ctx.lineWidth = 1;
  const step = 70;
  for (let x = 0; x < W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  
  ctx.strokeStyle = 'rgba(214,168,92,0.03)';
  for (let i = -H; i < W; i += step) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
  }

  
  ctx.strokeStyle = 'rgba(214,168,92,0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.42, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(214,168,92,0.08)';
  ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.28, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.15, 0, Math.PI * 2); ctx.stroke();

  
  const grad = ctx.createLinearGradient(0, H * 0.1, W, H * 0.9);
  grad.addColorStop(0,    'rgba(127,182,217,0)');
  grad.addColorStop(0.5,  'rgba(127,182,217,0.7)');
  grad.addColorStop(1,    'rgba(135,121,214,0)');
  ctx.strokeStyle = grad; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W * 0.05, H * 0.85);
  ctx.bezierCurveTo(W * 0.3, H * 0.2, W * 0.7, H * 0.8, W * 0.95, H * 0.15);
  ctx.stroke();

  
  const cx = W / 2, cy = H / 2;
  const sColor = '#d6a85c'; 
  const sGlow = 50;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, sGlow);
  g.addColorStop(0, sColor + 'ee');
  g.addColorStop(1, sColor + '00');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, sGlow, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = sColor; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();

  
  ctx.fillStyle = 'rgba(230,233,239,0.95)';
  ctx.font = '700 15px Inter, system-ui';
  ctx.fillText('Lubicz Park Kraków', cx + 18, cy + 5);

  
  ctx.fillStyle = 'rgba(214,168,92,0.15)';
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 20, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(214,168,92,0.6)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 20, 0, Math.PI * 2); ctx.stroke();
}

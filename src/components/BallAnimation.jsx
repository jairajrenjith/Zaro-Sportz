import { useEffect, useRef } from 'react';

const BALLS = [
  // football (soccer)
  { type: 'football', color: '#4ade80', size: 22 },
  { type: 'cricket',  color: '#86efac', size: 18 },
  { type: 'football', color: '#22c55e', size: 16 },
  { type: 'cricket',  color: '#4ade80', size: 26 },
  { type: 'football', color: '#166534', size: 20 },
  { type: 'cricket',  color: '#4ade80', size: 14 },
];

export default function BallAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;

    const balls = BALLS.map((b, i) => ({
      ...b,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.015,
    }));

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawFootball(ctx, x, y, r, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      // outer circle
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // pentagon lines (simplified)
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
        ctx.strokeStyle = '#4ade8088';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawCricket(ctx, x, y, r, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // seam line
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, 0);
      ctx.bezierCurveTo(-r * 0.2, -r * 0.5, r * 0.2, -r * 0.5, r * 0.5, 0);
      ctx.strokeStyle = '#86efac88';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, 0);
      ctx.bezierCurveTo(-r * 0.2, r * 0.5, r * 0.2, r * 0.5, r * 0.5, 0);
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      balls.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.rot += b.vrot;
        if (b.x < -b.size) b.x = W + b.size;
        if (b.x > W + b.size) b.x = -b.size;
        if (b.y < -b.size) b.y = H + b.size;
        if (b.y > H + b.size) b.y = -b.size;

        if (b.type === 'football') {
          drawFootball(ctx, b.x, b.y, b.size, b.rot);
        } else {
          drawCricket(ctx, b.x, b.y, b.size, b.rot);
        }
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.15,
      }}
    />
  );
}

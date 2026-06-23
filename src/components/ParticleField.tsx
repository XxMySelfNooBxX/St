import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number;
}

export function ParticleField({ stressScore }: { stressScore: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stressRef = useRef(stressScore);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  stressRef.current = stressScore;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const N = 55;
    const init = () => {
      particlesRef.current = Array.from({ length: N }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.8 + 0.4,
        opacity: Math.random() * 0.35 + 0.08,
      }));
    };
    init();
    window.addEventListener('resize', () => { resize(); init(); });

    const animate = () => {
      const score = stressRef.current;
      const speed = 0.3 + (score / 10) * 2.8;

      // Color gradient: calm=indigo → stressed=amber → panic=red
      const r = score <= 4 ? 99  : score <= 7 ? 245 : 239;
      const g = score <= 4 ? 102 : score <= 7 ? 158 : 68;
      const b = score <= 4 ? 241 : score <= 7 ? 11  : 68;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // Turbulence at high stress
        if (score > 6) {
          p.vx += (Math.random() - 0.5) * 0.12;
          p.vy += (Math.random() - 0.5) * 0.12;
          const cap = 1.8;
          p.vx = Math.max(-cap, Math.min(cap, p.vx));
          p.vy = Math.max(-cap, Math.min(cap, p.vy));
        }

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const opacity = stressScore > 0 ? Math.min(0.9, stressScore / 8) : 0;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity, transition: 'opacity 1.2s ease' }}
    />
  );
}

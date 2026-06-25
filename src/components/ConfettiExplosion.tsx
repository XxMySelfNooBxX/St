import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ConfettiExplosionProps {
  x: number;
  y: number;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  color: string;
  distanceX: number;
  distanceY: number;
  rotate: number;
  scale: number[];
  opacity: number[];
  duration: number;
}

export function ConfettiExplosion({ x, y, onComplete }: ConfettiExplosionProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#6366f1', '#818cf8', '#a855f7', '#10b981', '#34d399', '#f43f5e', '#fbbf24'];
    const newParticles = Array.from({ length: 40 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 30 + Math.random() * 80;
      const randMultiplierX = 1 + Math.random();
      const randMultiplierY = 1 + Math.random();
      
      return {
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        distanceX: Math.cos(angle) * velocity * randMultiplierX,
        distanceY: Math.sin(angle) * velocity * randMultiplierY - 30, // slight upward bias
        rotate: Math.random() * 360 * 2,
        scale: [0, 1, 0.5, 0],
        opacity: [1, 1, 0],
        duration: 0.8 + Math.random() * 0.5,
      };
    });
    setParticles(newParticles);

    const timer = setTimeout(() => {
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed z-[200] pointer-events-none"
      style={{ left: x, top: y }}
    >
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{ 
            x: p.distanceX, 
            y: p.distanceY + 50, // gravity effect
            scale: p.scale, 
            opacity: p.opacity,
            rotate: p.rotate
          }}
          transition={{ 
            duration: p.duration,
            ease: [0.25, 1, 0.5, 1]
          }}
          className="absolute w-2 h-2 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

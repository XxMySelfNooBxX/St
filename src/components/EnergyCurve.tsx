import { motion } from 'motion/react';
import { EnergyPoint } from '../types';

interface EnergyCurveProps {
  curve: EnergyPoint[];
}

export function EnergyCurve({ curve }: EnergyCurveProps) {
  if (!curve || curve.length === 0) return null;

  const maxEnergy = Math.max(...curve.map(p => p.energy), 10);
  const minEnergy = 0;
  
  // Create an SVG path for the area chart
  const w = 400; // viewbox width
  const h = 100; // viewbox height
  
  const stepX = w / (curve.length - 1 || 1);
  const points = curve.map((p, i) => {
    const x = i * stepX;
    const y = h - ((p.energy - minEnergy) / (maxEnergy - minEnergy)) * h;
    return `${x},${y}`;
  });

  const pathD = `M 0,${h} L ${points.join(' L ')} L ${w},${h} Z`;
  const lineD = `M ${points.join(' L ')}`;

  const currentHourIndex = 0; // The first item is always current hour

  // Dynamic theme color based on current energy level
  const currentEnergy = curve[0]?.energy ?? 7;
  const themeColor = currentEnergy >= 8 
    ? { stroke: 'rgb(16, 185, 129)', stop: 'rgb(16, 185, 129)', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' }
    : currentEnergy >= 5 
      ? { stroke: 'rgb(245, 158, 11)', stop: 'rgb(245, 158, 11)', text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' }
      : { stroke: 'rgb(244, 63, 94)', stop: 'rgb(244, 63, 94)', text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };

  return (
    <div className="bg-zinc-900 border border-white/10 p-4 rounded-xl glass-panel relative overflow-hidden flex flex-col h-full shrink-0">
      <div className="flex items-center justify-between mb-4 z-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Cognitive Capacity</h3>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${themeColor.text} ${themeColor.bg}`}>
          {curve[0]?.label || 'Moderate'}
        </span>
      </div>
      
      <div className="flex-1 relative min-h-[120px] w-full z-10 flex flex-col">
        {/* Y Axis Guides */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[9px] font-mono">
          <div className="border-t border-white/20 w-full"></div>
          <div className="border-t border-white/20 w-full"></div>
          <div className="border-t border-white/20 w-full"></div>
        </div>

        {/* SVG Area Chart */}
        <div className="absolute inset-x-0 bottom-0 top-0">
          <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={themeColor.stop} stopOpacity="0.4" />
                <stop offset="100%" stopColor={themeColor.stop} stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d={pathD}
              fill="url(#energyGrad)"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <motion.path
              d={lineD}
              fill="none"
              stroke={themeColor.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            
            {/* Dots */}
            {curve.map((p, i) => {
              const x = i * stepX;
              const y = h - ((p.energy - minEnergy) / (maxEnergy - minEnergy)) * h;
              const isCurrent = i === currentHourIndex;
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={isCurrent ? 4 : 2}
                  fill={isCurrent ? "#fff" : themeColor.stroke}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + i * 0.05 }}
                />
              );
            })}
          </svg>
        </div>

        {/* X Axis Labels - Mathematically Positioned */}
        <div className="absolute bottom-0 inset-x-0 text-[9px] font-mono text-zinc-600 translate-y-4">
          {curve.map((p, i) => {
            if (i % 3 !== 0 && i !== curve.length - 1) return null;
            const leftPercent = (i / (curve.length - 1 || 1)) * 100;
            return (
              <span 
                key={i} 
                className="absolute -translate-x-1/2" 
                style={{ left: `${leftPercent}%` }}
              >
                {String(p.hour).padStart(2, '0')}:00
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

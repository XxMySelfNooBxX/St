import { useMemo } from 'react';

interface BurndownEntry {
  remaining: number;
  timestamp: number;
  label?: string;
}

interface BurndownChartProps {
  history: BurndownEntry[];
  total: number;
  streak: number;
}

export function BurndownChart({ history, total, streak }: BurndownChartProps) {
  const W = 180;
  const H = 36;
  const PAD = 2;

  const points = useMemo(() => {
    if (history.length < 2) return '';
    const minT = history[0].timestamp;
    const maxT = history[history.length - 1].timestamp;
    const timeRange = Math.max(maxT - minT, 1);

    return history.map((entry) => {
      const x = PAD + ((entry.timestamp - minT) / timeRange) * (W - PAD * 2);
      const y = PAD + (entry.remaining / Math.max(total, 1)) * (H - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [history, total, W, H]);

  const idealPoints = useMemo(() => {
    if (history.length < 2) return '';
    return `${PAD},${PAD} ${W - PAD},${(H - PAD).toFixed(1)}`;
  }, [history, W, H, PAD]);

  if (history.length < 2) return null;

  const latestRemaining = history[history.length - 1].remaining;
  const isAheadOfSchedule = latestRemaining < total * 0.5 && history.length > 2;

  return (
    <div className="flex items-center gap-3">
      {/* Streak badge */}
      {streak >= 2 && (
        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg shrink-0">
          <span className="text-sm leading-none">🔥</span>
          <span className="text-[10px] font-bold text-amber-400">{streak} streak</span>
        </div>
      )}

      {/* Burndown sparkline */}
      <div className="flex flex-col gap-0.5">
        <div className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Burndown</div>
        <div className="relative" style={{ width: W, height: H }}>
          <svg width={W} height={H} className="overflow-visible">
            {/* Ideal line (dashed) */}
            <polyline
              points={idealPoints}
              fill="none"
              stroke="#3f3f46"
              strokeWidth="1"
              strokeDasharray="3,2"
            />
            {/* Actual line */}
            <polyline
              points={points}
              fill="none"
              stroke={isAheadOfSchedule ? '#10b981' : '#6366f1'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Latest dot */}
            {history.length > 0 && (() => {
              const last = points.split(' ').pop()?.split(',');
              if (!last) return null;
              return (
                <circle
                  cx={last[0]}
                  cy={last[1]}
                  r="2.5"
                  fill={isAheadOfSchedule ? '#10b981' : '#6366f1'}
                />
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Pace indicator */}
      {isAheadOfSchedule && (
        <div className="text-[9px] text-emerald-400 font-bold shrink-0">↑ Ahead</div>
      )}
    </div>
  );
}

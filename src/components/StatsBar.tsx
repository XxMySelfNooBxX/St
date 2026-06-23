import { useMemo } from 'react';
import { Task, ExecutionBlock } from '../types';
import { Clock, Zap, CheckCircle2, AlertTriangle, TrendingDown, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface StatsBarProps {
  tasks: Task[];
  schedule: ExecutionBlock[];
}

export function StatsBar({ tasks, schedule }: StatsBarProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const totalMinutesNeeded = pendingTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);

    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);
    const availableMinutes = Math.floor((midnight.getTime() - now.getTime()) / 60000);

    const ratio = totalMinutesNeeded / Math.max(availableMinutes, 1);
    const feasibility: 'feasible' | 'tight' | 'critical' =
      ratio <= 0.8 ? 'feasible' : ratio <= 1.05 ? 'tight' : 'critical';

    // Find currently active block
    const currentBlock = schedule.find(b => {
      try {
        const start = parseISO(b.startTime).getTime();
        const end = parseISO(b.endTime).getTime();
        return now.getTime() >= start && now.getTime() <= end;
      } catch { return false; }
    });

    // Find next upcoming block
    const nextBlock = schedule
      .filter(b => {
        try { return parseISO(b.startTime).getTime() > now.getTime(); }
        catch { return false; }
      })
      .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())[0];

    const hoursNeeded = Math.floor(totalMinutesNeeded / 60);
    const minsNeeded = totalMinutesNeeded % 60;
    const hoursAvail = Math.floor(availableMinutes / 60);
    const minsAvail = availableMinutes % 60;

    return { totalMinutesNeeded, availableMinutes, feasibility, currentBlock, nextBlock, hoursNeeded, minsNeeded, hoursAvail, minsAvail, pendingCount: pendingTasks.length };
  }, [tasks, schedule]);

  if (tasks.length === 0) return null;

  const feasibilityConfig = {
    feasible: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Feasible', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    tight:    { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Tight',    cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20'   },
    critical: { icon: <TrendingDown  className="w-3.5 h-3.5" />, label: 'Critical', cls: 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse' },
  }[stats.feasibility];

  return (
    <div className="bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">

      {/* Time needed */}
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <div>
          <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Needed</div>
          <div className="text-sm font-bold text-zinc-200 font-mono leading-none">
            {stats.hoursNeeded > 0 ? `${stats.hoursNeeded}h ` : ''}{stats.minsNeeded}m
          </div>
        </div>
      </div>

      <div className="w-px h-8 bg-white/10 shrink-0 hidden sm:block" />

      {/* Available today */}
      <div className="flex items-center gap-2">
        <Zap className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <div>
          <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Available</div>
          <div className="text-sm font-bold text-zinc-200 font-mono leading-none">
            {stats.hoursAvail > 0 ? `${stats.hoursAvail}h ` : ''}{stats.minsAvail}m
          </div>
        </div>
      </div>

      <div className="w-px h-8 bg-white/10 shrink-0 hidden sm:block" />

      {/* Feasibility */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${feasibilityConfig.cls}`}>
        {feasibilityConfig.icon}
        {feasibilityConfig.label}
      </div>

      {/* Pending count */}
      <div className="flex items-center gap-1.5 ml-auto">
        <span className="text-[10px] text-zinc-600 font-mono">{stats.pendingCount} tasks remaining</span>
      </div>

      {/* Current / Next block — full width row if needed */}
      {(stats.currentBlock || stats.nextBlock) && (
        <div className="w-full flex items-center gap-3 pt-1 mt-1 border-t border-white/5 flex-wrap">
          {stats.currentBlock && (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Now:</span>
              <span className={`text-[11px] font-semibold ${
                stats.currentBlock.type === 'break' ? 'text-emerald-400' :
                stats.currentBlock.type === 'work'  ? 'text-indigo-300' : 'text-zinc-400'
              }`}>{stats.currentBlock.title}</span>
            </div>
          )}
          {stats.currentBlock && stats.nextBlock && (
            <ArrowRight className="w-3 h-3 text-zinc-700 shrink-0" />
          )}
          {stats.nextBlock && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Next:</span>
              <span className="text-[11px] font-semibold text-zinc-400">{stats.nextBlock.title}</span>
              <span className="text-[10px] text-zinc-600 font-mono">
                @ {format(parseISO(stats.nextBlock.startTime), 'h:mm a')}
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

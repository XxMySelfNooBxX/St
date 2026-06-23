import { useState, useEffect } from 'react';
import { Task } from '../types';
import { Clock, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Live countdown timer component
function CountdownTimer({ deadline }: { deadline: string }) {
  const [display, setDisplay] = useState('');
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setDisplay('OVERDUE'); setIsCritical(true); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDisplay(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
      setIsCritical(diff < 3600000); // < 1 hour = critical
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <div className={`text-[10px] font-mono font-bold tabular-nums flex items-center gap-1 ${
      isCritical ? 'text-red-400 animate-pulse' : 'text-amber-400'
    }`}>
      ⏱ {display}
    </div>
  );
}

interface TaskTriageMatrixProps {
  tasks: Task[];
  onTaskComplete?: (taskId: string) => void;
}

export function TaskTriageMatrix({ tasks, onTaskComplete }: TaskTriageMatrixProps) {
  const urgent = tasks.filter(t => t.category === 'Urgent & Critical');
  const dependency = tasks.filter(t => t.category === 'High Dependency');
  const micro = tasks.filter(t => t.category === 'Micro-Tasks');
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const survivalRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const Section = ({ items, badgeBgClass, badgeText }: {
    items: Task[]; badgeBgClass: string; badgeText: string;
  }) => (
    <motion.div
      className="bg-zinc-900/50 border border-white/10 p-4 rounded-xl flex flex-col h-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeBgClass}`}>{badgeText}</span>
        <span className="text-xs text-zinc-500 font-medium">
          {items.filter(t => t.status === 'completed').length}/{items.length} done
        </span>
      </div>
      <div className="space-y-2 flex-1 min-h-[100px] max-h-[200px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic py-4">
            <span className="text-[10px] uppercase font-bold opacity-50">Empty</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((t: Task) => {
              const isDone = t.status === 'completed';
              const hasDeadline = t.deadline && t.deadline.length > 0;
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, height: 0, scale: 0.97 }}
                  animate={{ opacity: isDone ? 0.55 : 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className={`bg-zinc-900 p-2.5 rounded border text-xs flex flex-col gap-1 overflow-hidden ${
                    isDone ? 'border-emerald-500/20 bg-emerald-950/20'
                    : t.atRisk ? 'border-red-500/40 hover:border-red-500/60 hover:bg-zinc-800/50'
                    : 'border-white/10 hover:border-zinc-700 hover:bg-zinc-800/50'
                  } transition-colors`}
                >
                  <div className="flex items-start gap-2">
                    {/* Completion toggle */}
                    <motion.button
                      onClick={() => !isDone && onTaskComplete?.(t.id)}
                      disabled={isDone}
                      whileHover={isDone ? {} : { scale: 1.15 }}
                      whileTap={isDone ? {} : { scale: 0.9 }}
                      className={`mt-0.5 shrink-0 transition-colors ${isDone ? 'text-emerald-500 cursor-default' : 'text-zinc-600 hover:text-emerald-400'}`}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {isDone ? (
                          <motion.div key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </motion.div>
                        ) : (
                          <motion.div key="circle" initial={{ scale: 1 }} animate={{ scale: 1 }}>
                            <Circle className="w-3.5 h-3.5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <div className="flex items-start justify-between gap-2 flex-1 min-w-0">
                      <div className={`font-medium leading-snug flex-1 transition-all duration-300 ${isDone ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {t.title}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {t.atRisk && !isDone && (
                          <motion.div
                            className="flex items-center gap-1 bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded"
                            animate={{ opacity: [1, 0.6, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                            <span className="text-[9px] font-bold text-red-400 uppercase">AT RISK</span>
                          </motion.div>
                        )}
                        {isDone && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded"
                          >
                            <span className="text-[9px] font-bold text-emerald-400 uppercase">DONE</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isDone && (
                    <div className="flex items-center gap-3 pl-5 flex-wrap">
                      {t.estimatedMinutes && (
                        <div className="text-[10px] font-medium text-zinc-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />{t.estimatedMinutes}m
                        </div>
                      )}
                      {t.panicScore !== undefined && (
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: i * 0.05, duration: 0.3 }}
                                style={{ originY: 1 }}
                                className={`w-1 h-2 rounded-sm ${
                                  i < Math.round(t.panicScore! / 2)
                                    ? t.panicScore! >= 8 ? 'bg-red-500' : t.panicScore! >= 5 ? 'bg-amber-400' : 'bg-indigo-400'
                                    : 'bg-zinc-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[9px] text-zinc-600 font-mono">{t.panicScore}/10</span>
                        </div>
                      )}
                      {hasDeadline && <CountdownTimer deadline={t.deadline!} />}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Survival Progress Bar */}
      {tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/10 rounded-xl p-3 flex items-center gap-4"
        >
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Survival Progress</span>
              <motion.span
                key={survivalRate}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-xs font-bold font-mono ${
                  survivalRate === 100 ? 'text-emerald-400' : survivalRate >= 60 ? 'text-amber-400' : 'text-red-400'
                }`}
              >{survivalRate}%</motion.span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  survivalRate === 100 ? 'bg-emerald-500' : survivalRate >= 60 ? 'bg-amber-400' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${survivalRate}%` }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-zinc-200">
              {completedCount}<span className="text-zinc-600 text-sm">/{tasks.length}</span>
            </div>
            <div className="text-[9px] text-zinc-600 uppercase tracking-wider">tasks done</div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Section badgeText="URGENT" items={urgent} badgeBgClass="bg-red-500/10 text-red-400 border border-red-500/20" />
        <Section badgeText="DEPENDENCY" items={dependency} badgeBgClass="bg-amber-500/10 text-amber-400 border border-amber-500/20" />
        <Section badgeText="MICRO" items={micro} badgeBgClass="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" />
      </div>
    </div>
  );
}

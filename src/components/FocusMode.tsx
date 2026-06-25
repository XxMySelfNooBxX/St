import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pause, Play, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { ExecutionBlock, Task } from '../types';
import { format, parseISO } from 'date-fns';

// Soft chime using Web Audio API — no dependencies
function playChime(frequency = 523.25, duration = 2.0) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const osc2 = ctx.createOscillator(); // harmony
    const gain2 = ctx.createGain();

    osc.connect(gain); gain.connect(ctx.destination);
    osc2.connect(gain2); gain2.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.value = frequency;
    osc2.type = 'sine';
    osc2.frequency.value = frequency * 1.5; // perfect fifth

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.7);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + duration * 0.7);
  } catch { /* AudioContext not available */ }
}

// SVG progress ring
function ProgressRing({ radius, progress, color }: { radius: number; progress: number; color: string }) {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
      {/* Track */}
      <circle cx="100" cy="100" r={radius} fill="none" stroke="#27272a" strokeWidth="6" />
      {/* Progress */}
      <circle
        cx="100" cy="100" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
}

interface FocusModeProps {
  block: ExecutionBlock;
  task?: Task;
  onClose: () => void;
  onComplete: (taskId: string) => void;
}

export function FocusMode({ block, task, onClose, onComplete }: FocusModeProps) {
  const totalSeconds = task?.estimatedMinutes
    ? task.estimatedMinutes * 60
    : Math.max(60, Math.floor((parseISO(block.endTime).getTime() - parseISO(block.startTime).getTime()) / 1000));

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = secondsLeft / totalSeconds;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isUrgent = secondsLeft < 300; // < 5 min

  const timerColor = isDone ? '#10b981' : isUrgent ? '#ef4444' : task?.atRisk ? '#f59e0b' : '#6366f1';

  const handleDone = useCallback(() => {
    setIsDone(true);
    if (!isMuted) playChime(659.25, 3);
    if (task?.id) onComplete(task.id);
    setTimeout(onClose, 2500);
  }, [isMuted, task, onComplete, onClose]);

  useEffect(() => {
    if (isPaused || isDone) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          if (!isMuted) playChime();
          setIsDone(true);
          setTimeout(onClose, 2500);
          return 0;
        }
        // Chime at 5 min warning
        if (s === 301 && !isMuted) playChime(440, 1);
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isPaused, isDone, isMuted, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-3000"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${timerColor}18 0%, transparent 70%)`,
        }}
      />

      {/* Focus card */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full px-8"
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Status label */}
        <div className="mb-6 flex items-center gap-2">
          {isDone ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </motion.div>
          ) : (
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: timerColor }}
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            {isDone ? 'Block Complete!' : 'Focus Mode'}
          </span>
        </div>

        {/* Task title */}
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-2 leading-tight max-w-md">
          {task?.title ?? block.title}
        </h1>
        {task?.category && (
          <div className="text-xs text-zinc-500 mb-8 font-medium uppercase tracking-wider">{task.category}</div>
        )}

        {/* Timer ring */}
        <div className="relative w-52 h-52 flex items-center justify-center mb-8">
          <ProgressRing radius={88} progress={progress} color={timerColor} />
          <div className="relative z-10 flex flex-col items-center">
            <motion.span
              key={Math.floor(secondsLeft / 60)}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`text-5xl font-bold font-mono tabular-nums transition-colors duration-500`}
              style={{ color: timerColor }}
            >
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </motion.span>
            <span className="text-xs text-zinc-600 font-mono mt-1 uppercase tracking-wider">
              {isDone ? 'Done!' : isUrgent ? 'Almost there!' : 'remaining'}
            </span>
          </div>
        </div>

        {/* Controls */}
        {!isDone && (
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setIsPaused(p => !p)}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-xl text-sm font-semibold text-zinc-200 transition-all hover:scale-105 active:scale-95"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleDone}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: timerColor + '22', border: `1px solid ${timerColor}44`, color: timerColor }}
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Done
            </button>
          </div>
        )}

        {/* Mute + Close controls */}
        <div className="flex items-center gap-4 text-zinc-600">
          <button onClick={() => setIsMuted(m => !m)} className="hover:text-zinc-400 transition-colors flex items-center gap-1.5 text-xs">
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <span className="text-zinc-800">·</span>
          <button onClick={onClose} className="hover:text-zinc-400 transition-colors flex items-center gap-1.5 text-xs">
            <X className="w-3.5 h-3.5" /> Exit Focus
          </button>
        </div>

        {/* Scheduled time reference */}
        <div className="mt-6 text-[10px] text-zinc-700 font-mono">
          {format(parseISO(block.startTime), 'h:mm a')} — {format(parseISO(block.endTime), 'h:mm a')}
        </div>
      </motion.div>
    </motion.div>
  );
}

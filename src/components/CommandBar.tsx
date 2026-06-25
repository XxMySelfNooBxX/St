import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Loader2, Mic, Moon, Sun } from 'lucide-react';

interface CommandBarProps {
  onCommand: (command: string) => Promise<void>;
  isProcessing: boolean;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

export function CommandBar({ onCommand, isProcessing, toggleTheme, theme }: CommandBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard listeners for "/" and "Ctrl+Shift+V"
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setInput('');
      }
      // Voice command shortcut: Ctrl + Shift + V
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        if (typeof (window as any).startVoiceListening === 'function') {
          (window as any).startVoiceListening();
        }
      }
    };
    window.addEventListener('keydown', handler);
    // expose function to insert text from voice recognizer
    (window as any).insertCommandText = (txt: string) => {
      setInput(txt);
      setIsOpen(true);
    };
    return () => {
      window.removeEventListener('keydown', handler);
      delete (window as any).insertCommandText;
    };
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    const cmd = input.trim();
    setInput('');
    setIsOpen(false);
    await onCommand(cmd);
  };

  const EXAMPLES = [
    'move study session to 9pm',
    'add 30 min buffer before meeting',
    'skip the emails task',
    "what's the minimum I need to do?",
  ];

  return (
    <>
      {/* Trigger button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          title="Natural language command (Press /)"
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:border-indigo-500/30 hover:bg-zinc-800 transition-all group"
        >
          <Zap className="w-3 h-3 text-indigo-500 group-hover:text-indigo-400" />
          <span className="hidden sm:inline">Command</span>
          <kbd className="text-[9px] bg-zinc-800 border border-white/10 px-1 py-0.5 rounded font-mono">/</kbd>
        </button>
        <button
          onClick={() => {
            if (typeof (window as any).startVoiceListening === 'function') (window as any).startVoiceListening();
          }}
          title="Voice command (Ctrl+Shift+V)"
          className="flex items-center p-2 bg-zinc-900 border border-white/10 rounded-lg text-indigo-500 hover:bg-zinc-800 hover:border-indigo-500/30 transition-all"
        >
          <Mic className="w-4 h-4" />
        </button>
        <button
          onClick={() => toggleTheme()}
          title="Toggle dark/light mode"
          className="flex items-center p-2 bg-zinc-900 border border-white/10 rounded-lg text-yellow-400 hover:bg-zinc-800 hover:border-yellow-500/30 transition-all"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-400" />
          )}
        </button>
      </div>

      {/* Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex items-start justify-center pt-[20vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) { setIsOpen(false); setInput(''); } }}
          >
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" />

            <motion.div
              className="relative z-10 w-full max-w-xl mx-4"
              initial={{ scale: 0.95, y: -16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.97, y: -8, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <form onSubmit={handleSubmit} className="bg-zinc-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                  <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Tell the agent what to change..."
                    className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
                    disabled={isProcessing}
                  />
                  {isProcessing && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />}
                  {!isProcessing && input.trim() && (
                    <kbd className="text-[9px] bg-zinc-800 border border-white/10 px-1.5 py-1 rounded font-mono text-zinc-500">↵</kbd>
                  )}
                </div>

                {/* Example commands */}
                <div className="p-3">
                  <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-2 px-1">Examples</div>
                  <div className="space-y-1">
                    {EXAMPLES.map(ex => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => { setInput(ex); inputRef.current?.focus(); }}
                        className="w-full text-left text-xs text-zinc-500 hover:text-zinc-200 px-2 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors font-mono"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4 pb-3 text-[9px] text-zinc-700 flex items-center gap-3">
                  <span><kbd className="bg-zinc-800 px-1 py-0.5 rounded">↵</kbd> execute</span>
                  <span><kbd className="bg-zinc-800 px-1 py-0.5 rounded">Esc</kbd> close</span>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

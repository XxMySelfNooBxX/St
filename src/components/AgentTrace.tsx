import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Terminal, Code2 } from 'lucide-react';

interface AgentTraceProps {
  agentLog: string[];
  isProcessing: boolean;
  processingState: string;
}

export function AgentTrace({ agentLog, isProcessing, processingState }: AgentTraceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const completedCalls = agentLog.filter(log => log.includes('✓')).length;

  // Auto-scroll to bottom when log updates or processing state changes
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [agentLog, isProcessing, isOpen]);

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shrink-0 mb-4 mt-2 glass-panel">
      {/* Status Bar Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-700'}`} />
            <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-700'}`} style={isProcessing ? { animationDelay: '150ms' } : {}} />
            <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-700'}`} style={isProcessing ? { animationDelay: '300ms' } : {}} />
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[11px] font-mono text-zinc-300 uppercase tracking-tighter">
              {isProcessing
                ? `Agent: ${processingState || 'Working...'}`
                : agentLog.length > 0
                  ? 'Agent Status: Complete'
                  : 'Agent Status: Idle'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] opacity-60 flex gap-4 font-mono">
            {isProcessing && <span className="text-indigo-400 font-bold">Gemini 2.0 Flash</span>}
            {!isProcessing && agentLog.length > 0 && (
              <span className="hidden sm:inline text-emerald-500/70">
                ✓ {completedCalls} tools completed
              </span>
            )}
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </div>
      </button>

      {/* Trace Log Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-zinc-950/50"
          >
            <div 
              ref={scrollContainerRef}
              className="p-4 space-y-2 max-h-48 overflow-y-auto"
            >
              {agentLog.length === 0 && !isProcessing && (
                <div className="text-xs text-zinc-600 font-mono italic">Waiting for instructions...</div>
              )}
              {agentLog.map((log, i) => {
                const isComplete = log.includes('✓');
                const isCalling = log.includes('Calling');
                return (
                  <div key={i} className="flex items-start gap-2 text-xs font-mono">
                    <span className="text-zinc-600 shrink-0">[{String(i + 1).padStart(2, '0')}]</span>
                    {isCalling ? (
                      <Code2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    ) : isComplete ? (
                      <span className="text-emerald-500 shrink-0 ml-1">↳</span>
                    ) : (
                      <span className="w-3.5 shrink-0" />
                    )}
                    <span className={isComplete ? 'text-zinc-400' : 'text-zinc-300'}>
                      {log}
                    </span>
                  </div>
                );
              })}
              {isProcessing && (
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 animate-pulse mt-2">
                  <span className="w-4"></span>
                  Analyzing...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

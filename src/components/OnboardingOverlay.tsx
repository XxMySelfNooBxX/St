import { motion } from 'motion/react';
import { BrainCircuit, Activity, Zap, ShieldAlert } from 'lucide-react';

interface OnboardingOverlayProps {
  onDismiss: () => void;
}

export function OnboardingOverlay({ onDismiss }: OnboardingOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-2xl glass-panel relative overflow-hidden"
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ delay: 0.2, type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
        
        <div className="text-center mb-8 mt-2">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
            Welcome to Life Saver
          </h2>
          <p className="text-zinc-400 text-sm">
            Your agentic co-pilot for when everything is due yesterday.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <FeatureCard 
            icon={<BrainCircuit className="w-5 h-5 text-indigo-400" />}
            title="Brain Dump"
            desc="Just type out everything you're stressed about. The agent automatically extracts, estimates, and schedules tasks."
            delay={0.3}
          />
          <FeatureCard 
            icon={<ShieldAlert className="w-5 h-5 text-red-400" />}
            title="Panic Triage"
            desc="Tasks are assigned a Panic Score (0-10) based on deadlines and dependencies to ensure survival."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Zap className="w-5 h-5 text-amber-400" />}
            title="Energy Alignment"
            desc="The agent predicts your circadian energy curve and schedules high-focus tasks during your peak hours."
            delay={0.5}
          />
          <FeatureCard 
            icon={<Activity className="w-5 h-5 text-emerald-400" />}
            title="Agentic Depth"
            desc="Behind the scenes, the agent calls tools to break down complex tasks, detect conflicts, and batch work."
            delay={0.6}
          />
        </div>

        <div className="flex justify-center">
          <motion.button
            onClick={onDismiss}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-colors"
          >
            I'm Ready to Survive
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-white/5 border border-white/10 p-4 rounded-xl flex gap-3 items-start"
    >
      <div className="mt-0.5 p-2 bg-black/20 rounded-lg shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-zinc-100 font-bold text-sm mb-1">{title}</h3>
        <p className="text-zinc-400 text-xs leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

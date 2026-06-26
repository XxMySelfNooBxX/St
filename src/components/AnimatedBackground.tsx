import { motion } from 'motion/react';
import { useTheme } from '../hooks/useTheme';

export function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  if (!isDark) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundImage: 'radial-gradient(circle at center, rgba(165, 180, 252, 0.3) 0%, transparent 60%)', willChange: 'transform, opacity' }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.7, 0.5],
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundImage: 'radial-gradient(circle at center, rgba(216, 180, 254, 0.3) 0%, transparent 60%)', willChange: 'transform, opacity' }}
          className="absolute top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
          x: [0, 150, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ backgroundImage: 'radial-gradient(circle at center, rgba(79, 70, 229, 0.15) 0%, transparent 60%)', willChange: 'transform, opacity' }}
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -150, 0],
          y: [0, 150, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        style={{ backgroundImage: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.15) 0%, transparent 60%)', willChange: 'transform, opacity' }}
        className="absolute top-[30%] -right-[10%] w-[80%] h-[80%] rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        style={{ backgroundImage: 'radial-gradient(circle at center, rgba(5, 150, 105, 0.1) 0%, transparent 60%)', willChange: 'transform, opacity' }}
        className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full"
      />
    </div>
  );
}

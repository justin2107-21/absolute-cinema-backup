import { motion } from 'framer-motion';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.png';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const { theme } = useMood();

  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background",
        theme.gradient
      )}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      {/* Ambient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[120px]"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [-20, 20, -20],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/20 rounded-full blur-[100px]"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.35, 0.15],
            y: [-20, 20, -20],
          }}
          transition={{ duration: 4.5, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
        />
      </div>

      {/* Logo with smooth animations */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.4 }
        }}
        className="relative"
      >
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="absolute w-32 h-32 rounded-full border-2 border-primary/20"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute w-32 h-32 rounded-full border-2 border-primary/20"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
          />
        </motion.div>

        {/* Logo image */}
        <motion.img
          src={logoImage}
          alt="Absolute Cinema"
          className="h-24 w-24 rounded-full object-cover shadow-2xl"
          animate={{ 
            rotate: 360,
            boxShadow: [
              '0 0 20px hsl(var(--primary) / 0.3)',
              '0 0 40px hsl(var(--primary) / 0.5)',
              '0 0 20px hsl(var(--primary) / 0.3)',
            ],
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      </motion.div>

      {/* App name with staggered animation */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        className="mt-8 text-center"
      >
        <motion.h1 
          className="text-4xl font-bold tracking-tight"
          initial={{ letterSpacing: '0.1em' }}
          animate={{ letterSpacing: '0em' }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.span 
            className="text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            Absolute
          </motion.span>
          <motion.span 
            className="text-primary ml-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            Cinema
          </motion.span>
        </motion.h1>
        <motion.p
          className="text-muted-foreground mt-3 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          Movies that match your mood
        </motion.p>
      </motion.div>

      {/* Smooth loading indicator */}
      <motion.div
        className="mt-10 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              y: [-6, 6, -6],
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

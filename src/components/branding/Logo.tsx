import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import logoImage from '@/assets/logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', animated = false, showText = true, className }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        className={cn('relative flex items-center justify-center', sizeClasses[size])}
        animate={animated ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={animated ? {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        } : {}}
      >
        <motion.img
          src={logoImage}
          alt="Absolute Cinema Logo"
          className={cn('rounded-full object-cover', sizeClasses[size])}
          initial={animated ? { rotate: 0 } : {}}
          animate={animated ? { rotate: 360 } : {}}
          transition={animated ? { duration: 20, repeat: Infinity, ease: 'linear' } : {}}
        />

        {/* Glow effect for animated state */}
        {animated && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}
      </motion.div>

      {showText && (
        <motion.div 
          className={cn('font-bold tracking-tight', textSizes[size])}
          initial={animated ? { opacity: 0, x: -10 } : {}}
          animate={animated ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <span className="text-foreground">Absolute</span>
          <span className="text-primary ml-1">Cinema</span>
        </motion.div>
      )}
    </div>
  );
}

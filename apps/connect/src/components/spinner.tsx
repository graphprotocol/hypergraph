'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'primary' | 'secondary' | 'accent' | 'white';
  className?: string;
}

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  };

  const colorClasses = {
    default: 'border-muted-foreground/30 border-t-muted-foreground',
    primary: 'border-primary/30 border-t-primary',
    secondary: 'border-secondary/30 border-t-secondary',
    accent: 'border-accent/30 border-t-accent',
    white: 'border-white/30 border-t-white',
  };

  return (
    <motion.div
      className={cn('rounded-full animate-spin', sizeClasses[size], colorClasses[color], className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        ease: 'linear',
        repeat: Number.POSITIVE_INFINITY,
      }}
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </motion.div>
  );
}

import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '../../ui/Button/Button';

export interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-on-surface/40">
          {icon}
        </span>
      </div>
      <h3 className="font-headline text-headline-lg font-semibold mb-2">
        {title}
      </h3>
      <p className="font-body text-body text-on-surface/60 mb-6 max-w-md">
        {message}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}

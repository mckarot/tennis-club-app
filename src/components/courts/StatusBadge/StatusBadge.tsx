import { motion, useReducedMotion } from 'framer-motion';
import type { StatusBadgeProps, StatusBadgeVariant } from './StatusBadge.types';
import { statusBadgeConfig, statusBadgeSizes } from './StatusBadge.types';

export function StatusBadge({
  variant,
  label,
  size = 'md',
  withIcon = true,
  className = '',
}: StatusBadgeProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const config = statusBadgeConfig[variant];
  const displayLabel = label || config.label;
  const sizeClasses = statusBadgeSizes[size];

  return (
    <motion.span
      initial={{ opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
      className={`
        inline-flex items-center rounded-full font-medium uppercase
        ${config.colorClass}
        ${sizeClasses}
        ${className}
      `}
      role="status"
      aria-label={`Status: ${displayLabel}`}
    >
      {withIcon && (
        <span className="material-symbols-outlined" style={{ fontSize: size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px' }}>
          {config.icon}
        </span>
      )}
      <span>{displayLabel}</span>
    </motion.span>
  );
}

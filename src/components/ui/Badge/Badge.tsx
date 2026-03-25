import type { ReactNode } from 'react';
import type { BadgeVariant, BadgeSize } from './Badge.types';
import { badgeVariants, badgeSizes } from './Badge.types';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  withDot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'medium',
  withDot = false,
  className = '',
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1 font-medium rounded-full uppercase transition-all duration-200 motion-reduce:transition-none';
  const variantStyles = badgeVariants[variant];
  const sizeStyles = badgeSizes[size];

  return (
    <span className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}>
      {withDot && <span className="w-2 h-2 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
}

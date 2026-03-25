import type { ReactNode } from 'react';
import type { ChipSize } from './Chip.types';
import { chipBaseStyles, chipSizes } from './Chip.types';

export interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  size?: ChipSize;
  icon?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export function Chip({
  children,
  selected = false,
  size = 'medium',
  icon,
  onClick,
  className = '',
  ariaLabel,
}: ChipProps) {
  const sizeStyles = chipSizes[size];
  const selectedStyles = selected ? 'bg-primary text-white' : '';
  const clickableStyles = onClick ? 'cursor-pointer transition-all duration-200 ease-out motion-reduce:transition-none hover:scale-[1.02] active:scale-[0.98] hover:bg-surface-container-highest/70' : 'cursor-default';

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        ${chipBaseStyles}
        ${sizeStyles}
        ${selectedStyles}
        ${clickableStyles}
        ${className}
      `}
      aria-pressed={selected}
    >
      {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
      {children}
    </button>
  );
}

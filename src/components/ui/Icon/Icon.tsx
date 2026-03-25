import type { IconSize } from './Icon.types';
import { iconSizes } from './Icon.types';

export interface IconProps {
  name: string;
  size?: IconSize;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

export function Icon({
  name,
  size = 'medium',
  className = '',
  ariaLabel,
  onClick,
}: IconProps) {
  const sizeStyles = iconSizes[size];
  const clickableStyles = onClick ? 'cursor-pointer hover:opacity-70 transition-opacity' : '';

  return (
    <span
      className={`material-symbols-outlined ${sizeStyles} ${clickableStyles} ${className}`}
      aria-label={ariaLabel}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') { e.preventDefault(); onClick(); } } : undefined}
    >
      {name}
    </span>
  );
}

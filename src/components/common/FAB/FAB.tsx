import type { ReactNode } from 'react';
import type { FABVariant } from './FAB.types';
import { fabVariants } from './FAB.types';

export interface FABProps {
  icon?: string;
  children?: ReactNode;
  variant?: FABVariant;
  onClick?: () => void;
  extended?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function FAB({
  icon,
  children,
  variant = 'primary',
  onClick,
  extended = false,
  className = '',
  ariaLabel,
}: FABProps) {
  const baseStyles = 'fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-40 font-semibold transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantStyles = fabVariants[variant];
  const extendedStyles = extended ? 'px-8 py-4 gap-2' : 'p-4';

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || (icon ? icon : 'Action')}
      className={`${baseStyles} ${variantStyles} ${extendedStyles} ${className}`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="material-symbols-outlined">{icon}</span>}
        {extended && children && <span>{children}</span>}
        {!extended && children}
      </div>
    </button>
  );
}

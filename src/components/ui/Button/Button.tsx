import type { ReactNode } from 'react';
import type { ButtonVariant, ButtonSize } from './Button.types';
import { buttonVariants, buttonSizes } from './Button.types';

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  ariaLabel?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  ariaLabel,
}: ButtonProps) {
  const baseStyles = 'font-semibold transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:transition-none motion-reduce:transform-none hover:scale-[1.02] active:scale-[0.98]';
  const variantStyles = buttonVariants[variant];
  const sizeStyles = buttonSizes[size];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

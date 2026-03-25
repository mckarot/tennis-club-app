import type { ReactNode } from 'react';
import type { CardVariant } from './Card.types';
import { cardVariants } from './Card.types';

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
  elevation?: 'none' | 'raised' | 'overlay';
}

export function Card({
  children,
  variant = 'default',
  className = '',
  onClick,
  elevation = 'none',
}: CardProps) {
  const baseStyles = 'transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none';
  const variantStyles = cardVariants[variant];
  const elevationStyles = elevation === 'raised' ? 'shadow-md' : elevation === 'overlay' ? 'shadow-xl' : '';
  const hoverStyles = onClick ? 'hover:-translate-y-1 hover:shadow-xl cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${elevationStyles} ${hoverStyles} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`font-headline text-headline-md font-semibold ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`font-body text-body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mt-4 pt-4 border-t border-surface-container-highest ${className}`}>{children}</div>;
}

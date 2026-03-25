import type { ReactNode } from 'react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: number;
    label: string;
  };
  children?: ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  children,
  className = '',
}: StatsCardProps) {
  return (
    <div className={`bg-surface-container-low rounded-xl p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-body text-label text-on-surface/60 uppercase mb-1">
            {title}
          </p>
          <p className="font-headline text-display-sm font-bold text-on-surface">
            {value}
          </p>
        </div>
        {icon && (
          <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">
              {icon}
            </span>
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-2">
          <span
            className={`font-body text-body-sm font-semibold ${
              trend.value >= 0 ? 'text-primary' : 'text-tertiary'
            }`}
          >
            {trend.value >= 0 ? '+' : ''}
            {trend.value}%
          </span>
          <span className="font-body text-body-sm text-on-surface/60">
            {trend.label}
          </span>
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

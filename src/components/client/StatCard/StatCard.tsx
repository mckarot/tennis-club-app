/**
 * StatCard Component
 *
 * Atomic stat card with icon, value, label, and optional trend.
 * Uses Framer Motion for hover scale animation.
 *
 * @module @components/client/StatCard
 */

import { motion } from 'framer-motion';
import type { StatCardData } from '../../../types/client-dashboard.types';

interface StatCardProps {
  stat: StatCardData;
  loading?: boolean;
}

export function StatCard({ stat, loading = false }: StatCardProps) {
  if (loading) {
    return (
      <div
        className="rounded-xl bg-surface-container-lowest p-6 shadow-sm"
        role="status"
        aria-label="Loading statistic"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-lg bg-surface-container-highest" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-surface-container-highest" />
            <div className="h-8 w-16 animate-pulse rounded bg-surface-container-highest" />
          </div>
        </div>
      </div>
    );
  }

  const getIconColor = (icon: string): string => {
    // Color mapping based on stat type
    if (icon === 'event' || icon === 'schedule') {
      return 'text-primary';
    }
    if (icon === 'construction') {
      return 'text-secondary';
    }
    return 'text-on-surface';
  };

  const getTrendArrow = (trend: 'up' | 'down' | 'neutral' | undefined): string => {
    if (!trend) return '';
    const arrows = {
      up: 'arrow_upward',
      down: 'arrow_downward',
      neutral: 'remove',
    };
    return arrows[trend];
  };

  return (
    <motion.div
      className="rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="article"
      aria-label={`${stat.label}: ${stat.value}`}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed/20"
          aria-hidden="true"
        >
          <span
            className={`material-symbols-outlined text-2xl ${getIconColor(stat.icon)}`}
          >
            {stat.icon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="font-body text-body-sm text-on-surface/70">{stat.label}</p>
          <p className="font-headline text-headline-lg font-bold text-on-surface">
            {stat.value}
          </p>

          {/* Trend */}
          {stat.trend && (
            <div className="mt-1 flex items-center gap-1">
              <span
                className={`material-symbols-outlined text-xs ${
                  stat.trend === 'up'
                    ? 'text-primary'
                    : stat.trend === 'down'
                      ? 'text-secondary'
                      : 'text-on-surface/40'
                }`}
              >
                {getTrendArrow(stat.trend)}
              </span>
              {stat.trendValue && (
                <span className="font-body text-label text-on-surface/60">
                  {stat.trendValue > 0 ? '+' : ''}
                  {stat.trendValue}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;

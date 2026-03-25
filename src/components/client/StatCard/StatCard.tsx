/**
 * StatCard Component
 * 
 * Individual stat card with icon, label, value
 * PNG spec: bg-surface-container-low, text-3xl font-extrabold
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { StatCardData } from '../../../types/client-dashboard.types';

export interface StatCardProps {
  stat: StatCardData;
  isLoading?: boolean;
}

export function StatCard({ stat, isLoading = false }: StatCardProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, scale: shouldReduceMotion ? 1 : 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' },
    },
  };

  if (isLoading) {
    return (
      <div
        className="
          bg-surface-container-low rounded-xl p-6
          animate-pulse
        "
        aria-busy="true"
        aria-label="Chargement des statistiques"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-surface-container-highest rounded-full" />
          <div className="w-16 h-6 bg-surface-container-highest rounded" />
        </div>
        <div className="w-24 h-10 bg-surface-container-highest rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="
        bg-surface-container-low rounded-xl p-6
        shadow-sm hover:shadow-md
        transition-shadow duration-200
      "
      role="status"
      aria-label={`${stat.label}: ${stat.value}`}
    >
      {/* Icon and Trend */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="
            w-10 h-10 rounded-full
            bg-primary-fixed/20
            flex items-center justify-center
          "
          aria-hidden="true"
        >
          <span className="material-symbols-outlined text-primary text-xl">
            {stat.icon}
          </span>
        </div>

        {stat.trend && (
          <div
            className={`
              inline-flex items-center gap-1
              font-body text-body-sm font-medium
              ${stat.trend === 'up' ? 'text-success' : ''}
              ${stat.trend === 'down' ? 'text-error' : ''}
              ${stat.trend === 'neutral' ? 'text-on-surface-variant' : ''}
            `}
          >
            <span className="material-symbols-outlined text-sm">
              {stat.trend === 'up' ? 'trending_up' : stat.trend === 'down' ? 'trending_down' : 'remove'}
            </span>
            {stat.trendValue && (
              <span>{stat.trendValue > 0 ? '+' : ''}{stat.trendValue}%</span>
            )}
          </div>
        )}
      </div>

      {/* Label */}
      <p className="font-body text-body-sm text-on-surface-variant mb-2">
        {stat.label}
      </p>

      {/* Value */}
      <p
        className="
          font-headline text-3xl font-extrabold
          text-on-surface
        "
      >
        {stat.value.toLocaleString('fr-FR')}
      </p>
    </motion.div>
  );
}

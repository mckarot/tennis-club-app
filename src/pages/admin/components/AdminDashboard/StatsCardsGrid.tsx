/**
 * StatsCardsGrid Component
 *
 * Displays 3 statistics cards for the admin dashboard.
 * Shows active bookings, maintenance count, and available slots with trends.
 *
 * Features:
 * - 3 cards with trend indicators
 * - Color-coded (primary, secondary, primary)
 * - Framer Motion animations
 * - ARIA labels for accessibility
 *
 * @module @pages/admin/components/AdminDashboard/StatsCardsGrid
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { DashboardStats } from '../../../hooks/useAdminDashboard';

/**
 * StatsCardsGrid component props
 */
export interface StatsCardsGridProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

/**
 * Individual stat card configuration
 */
interface StatCardConfig {
  title: string;
  value: number;
  trend: number;
  icon: string;
  color: 'primary' | 'secondary';
  ariaLabel: string;
}

/**
 * Format trend percentage with sign
 */
function formatTrend(trend: number): string {
  const sign = trend >= 0 ? '+' : '';
  return `${sign}${trend}%`;
}

/**
 * Get trend color class
 */
function getTrendColorClass(trend: number): string {
  if (trend > 0) return 'text-primary';
  if (trend < 0) return 'text-tertiary';
  return 'text-on-surface-variant';
}

/**
 * Get trend icon
 */
function getTrendIcon(trend: number): string {
  if (trend > 0) return 'trending_up';
  if (trend < 0) return 'trending_down';
  return 'trending_flat';
}

/**
 * StatsCardsGrid component
 */
export function StatsCardsGrid({
  stats,
  isLoading = false,
}: StatsCardsGridProps): JSX.Element {
  const cards: StatCardConfig[] = [
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      trend: stats.activeBookingsTrend,
      icon: 'event_available',
      color: 'primary',
      ariaLabel: `Active bookings: ${stats.activeBookings}, trend ${formatTrend(stats.activeBookingsTrend)}`,
    },
    {
      title: 'Maintenance',
      value: stats.maintenanceCount,
      trend: stats.maintenanceTrend,
      icon: 'build',
      color: 'secondary',
      ariaLabel: `Courts in maintenance: ${stats.maintenanceCount}, trend ${formatTrend(stats.maintenanceTrend)}`,
    },
    {
      title: 'Available Slots',
      value: stats.availableSlots,
      trend: stats.availableSlotsTrend,
      icon: 'schedule',
      color: 'primary',
      ariaLabel: `Available slots: ${stats.availableSlots}, trend ${formatTrend(stats.availableSlotsTrend)}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="region"
      aria-label="Dashboard Statistics"
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md"
          role="article"
          aria-label={card.ariaLabel}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-body text-sm font-medium text-on-surface-variant">
                {card.title}
              </p>

              {isLoading ? (
                <div className="mt-2 h-10 w-20 animate-pulse rounded bg-surface-container-highest" />
              ) : (
                <p className="mt-2 font-headline text-3xl font-bold text-on-surface">
                  {card.value}
                </p>
              )}

              {!isLoading && (
                <div className="mt-2 flex items-center gap-1">
                  <span
                    className={`material-symbols-outlined text-sm ${getTrendColorClass(card.trend)}`}
                    aria-hidden="true"
                  >
                    {getTrendIcon(card.trend)}
                  </span>
                  <span
                    className={`font-body text-xs font-semibold ${getTrendColorClass(card.trend)}`}
                  >
                    {formatTrend(card.trend)}
                  </span>
                  <span className="font-body text-xs text-on-surface-variant">
                    vs yesterday
                  </span>
                </div>
              )}
            </div>

            <div
              className={`rounded-lg p-3 ${
                card.color === 'primary'
                  ? 'bg-primary-fixed/20'
                  : 'bg-secondary-fixed/20'
              }`}
              aria-hidden="true"
            >
              <span
                className={`material-symbols-outlined text-3xl ${
                  card.color === 'primary' ? 'text-primary' : 'text-secondary'
                }`}
              >
                {card.icon}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default StatsCardsGrid;

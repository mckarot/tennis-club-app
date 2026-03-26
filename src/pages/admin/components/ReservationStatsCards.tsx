/**
 * ReservationStatsCards Component
 *
 * Displays 3 stat cards: ACTIVE BOOKINGS / MAINTENANCE / AVAILABLE SLOTS.
 *
 * Features:
 * - 3 cartes : ACTIVE BOOKINGS / MAINTENANCE / AVAILABLE SLOTS
 * - Couleurs stats (mint, terracotta, coral)
 * - Trend indicators (+12%, -50%, etc.)
 * - Skeleton loading
 * - Framer Motion animations
 * - ARIA : role="region"
 *
 * @module @pages/admin/components/ReservationStatsCards
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface ReservationStats {
  activeBookings: number;
  maintenance: number;
  availableSlots: number;
  activeBookingsTrend?: number;
  maintenanceTrend?: number;
  availableSlotsTrend?: number;
}

export interface ReservationStatsCardsProps {
  stats: ReservationStats | null;
  isLoading?: boolean;
}

/**
 * Skeleton card for loading state
 */
function StatsCardSkeleton() {
  return (
    <div
      className="rounded-xl bg-surface-container-low p-6 shadow-sm"
      aria-hidden="true"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-surface-container-highest" />
        <div className="h-4 w-24 animate-pulse rounded bg-surface-container-highest" />
      </div>
      <div className="mb-2 h-8 w-16 animate-pulse rounded bg-surface-container-highest" />
      <div className="h-4 w-20 animate-pulse rounded bg-surface-container-highest" />
    </div>
  );
}

/**
 * Individual stat card
 */
interface StatCardProps {
  title: string;
  value: number;
  trend?: number;
  icon: string;
  colorClass: string;
  trendColorClass: string;
  delay?: number;
}

function StatCard({
  title,
  value,
  trend,
  icon,
  colorClass,
  trendColorClass,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      role="region"
      aria-label={`${title}: ${value}`}
      className="rounded-xl bg-surface-container-low p-6 shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}>
          <span className="material-symbols-outlined text-xl text-white">{icon}</span>
        </div>
        <span className="font-body text-sm font-medium text-on-surface-variant">
          {title}
        </span>
      </div>

      {/* Value */}
      <motion.div
        className="mb-2"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.1 }}
      >
        <span className="font-headline text-3xl font-bold text-on-surface">
          {value}
        </span>
      </motion.div>

      {/* Trend */}
      {trend !== undefined && (
        <div className="flex items-center gap-1">
          <span
            className={`font-body text-sm font-medium ${trendColorClass}`}
          >
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>
          <span className="material-symbols-outlined text-sm text-on-surface-variant">
            {trend > 0 ? 'trending_up' : trend < 0 ? 'trending_down' : 'remove'}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export function ReservationStatsCards({
  stats,
  isLoading = false,
}: ReservationStatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3" role="region" aria-label="Reservation statistics loading">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3" role="region" aria-label="Reservation statistics">
      {/* ACTIVE BOOKINGS */}
      <StatCard
        title="ACTIVE BOOKINGS"
        value={stats.activeBookings}
        trend={stats.activeBookingsTrend}
        icon="event"
        colorClass="bg-[#006b3f]" // Mint green (PRO color from audit)
        trendColorClass={
          (stats.activeBookingsTrend ?? 0) >= 0
            ? 'text-[#006b3f]'
            : 'text-error'
        }
        delay={0}
      />

      {/* MAINTENANCE */}
      <StatCard
        title="MAINTENANCE"
        value={stats.maintenance}
        trend={stats.maintenanceTrend}
        icon="build"
        colorClass="bg-terracotta" // Terracotta
        trendColorClass={
          (stats.maintenanceTrend ?? 0) <= 0
            ? 'text-terracotta'
            : 'text-error'
        }
        delay={0.1}
      />

      {/* AVAILABLE SLOTS */}
      <StatCard
        title="AVAILABLE SLOTS"
        value={stats.availableSlots}
        trend={stats.availableSlotsTrend}
        icon="schedule"
        colorClass="bg-coral" // Coral
        trendColorClass={
          (stats.availableSlotsTrend ?? 0) >= 0
            ? 'text-coral'
            : 'text-error'
        }
        delay={0.2}
      />
    </div>
  );
}

export default ReservationStatsCards;

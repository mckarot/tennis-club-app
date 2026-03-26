/**
 * ClubEfficiencyCard Component
 *
 * Displays club efficiency statistics.
 * Based on PNG audit: Progress bar height 8px, fill #006b3f,
 * occupancy rate in bold 32px.
 *
 * Features:
 * - Title "CLUB EFFICIENCY"
 * - Progress bar (height 8px, fill #006b3f)
 * - Occupancy rate in bold 32px
 * - Number of students
 * - Growth rate
 * - ARIA compliant
 * - Framer Motion animations
 *
 * @module @components/moniteur/ClubEfficiencyCard
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ClubEfficiencyCardProps } from '../../types/moniteur.types';

/**
 * Container variants for stagger
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Item variants for stats
 */
const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

/**
 * ClubEfficiencyCard Component
 */
export function ClubEfficiencyCard({
  stats,
  period,
}: ClubEfficiencyCardProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (!stats) {
    return (
      <div
        role="region"
        aria-label="Club efficiency statistics loading"
        className="rounded-xl bg-surface-container-low p-6 animate-pulse"
      >
        <div className="h-32 bg-surface-container-highest/30 rounded" />
      </div>
    );
  }

  const occupancyPercent = Math.min(100, Math.max(0, stats.occupancyRate));

  return (
    <motion.section
      role="region"
      aria-label="Statistiques du club"
      className="rounded-xl bg-surface-container-low p-6"
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-body text-xs font-bold uppercase tracking-widest text-on-surface/60">
          Club Efficiency
        </h2>
        {period && (
          <span className="font-body text-xs text-on-surface/50">{period}</span>
        )}
      </div>

      {/* Main stats */}
      <div className="space-y-6">
        {/* Occupancy rate */}
        <div>
          <div className="flex items-end gap-2 mb-2">
            <span className="font-headline text-3xl font-bold text-on-surface">
              {occupancyPercent.toFixed(0)}%
            </span>
            <span className="font-body text-sm text-on-surface/60 mb-1">
              occupancy rate
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="relative h-2 rounded-full bg-surface-container-highest overflow-hidden"
            role="progressbar"
            aria-valuenow={occupancyPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Occupancy rate"
          >
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${occupancyPercent}%` }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <motion.div 
          className="grid grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Total slots */}
          <StatItem
            label="Total Slots"
            value={stats.totalSlots}
            icon="calendar_view_week"
            delay={0.1}
          />

          {/* Booked slots */}
          <StatItem
            label="Booked"
            value={stats.bookedSlots}
            icon="check_circle"
            color="#006b3f"
            delay={0.15}
          />

          {/* Available slots */}
          <StatItem
            label="Available"
            value={stats.availableSlots}
            icon="schedule"
            color="#9d431b"
            delay={0.2}
          />
        </motion.div>

        {/* Students and growth */}
        <div className="flex items-center gap-4 pt-4 border-t border-surface-container-highest">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">groups</span>
            <div>
              <p className="font-headline text-xl font-bold text-on-surface">
                {stats.totalStudents}
              </p>
              <p className="font-body text-xs text-on-surface/60">Students</p>
            </div>
          </div>

          {stats.growthRate !== undefined && (
            <div className={`flex items-center gap-1 ${stats.growthRate >= 0 ? 'text-primary' : 'text-tertiary'}`}>
              <span className="material-symbols-outlined text-sm">
                {stats.growthRate >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              <span className="font-body text-sm font-semibold">
                {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

/**
 * StatItem Component (internal)
 */
interface StatItemProps {
  label: string;
  value: number;
  icon: string;
  color?: string;
  delay: number;
}

function StatItem({ label, value, icon, color, delay }: StatItemProps) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      className="text-center"
      variants={itemVariants}
      transition={{ delay: shouldReduceMotion ? 0 : delay, duration: shouldReduceMotion ? 0 : 0.2 }}
    >
      <span
        className="material-symbols-outlined text-2xl mb-1"
        style={{ color: color || '#006b3f' }}
      >
        {icon}
      </span>
      <p className="font-headline text-xl font-bold text-on-surface">{value}</p>
      <p className="font-body text-xs text-on-surface/60 uppercase tracking-wide">
        {label}
      </p>
    </motion.div>
  );
}

export default ClubEfficiencyCard;

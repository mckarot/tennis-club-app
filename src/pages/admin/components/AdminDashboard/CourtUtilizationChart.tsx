/**
 * CourtUtilizationChart Component
 *
 * Displays court utilization as a bar chart with 12 time slots.
 * Shows utilization percentages from 06:00 to 21:00.
 *
 * Features:
 * - 12 bars (06:00, 08:00, ..., 20:00)
 * - 3 color levels (peak/primary, high/secondary, low/gray)
 * - Hover tooltip with percentage
 * - Framer Motion animations
 * - ARIA labels for accessibility
 *
 * @module @pages/admin/components/AdminDashboard/CourtUtilizationChart
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { CourtUtilizationSlot } from '../../../hooks/useCourtUtilization';

/**
 * CourtUtilizationChart component props
 */
export interface CourtUtilizationChartProps {
  data: CourtUtilizationSlot[];
  isLoading?: boolean;
}

/**
 * Get Tailwind class for bar color based on utilization level
 */
function getBarColorClass(level: 'low' | 'high' | 'peak'): string {
  switch (level) {
    case 'peak':
      return 'bg-primary';
    case 'high':
      return 'bg-secondary';
    case 'low':
      return 'bg-surface-container-highest';
  }
}

/**
 * Get bar height percentage (max 100%)
 */
function getBarHeight(utilization: number): number {
  return Math.min(100, Math.max(5, utilization));
}

/**
 * CourtUtilizationChart component
 */
export function CourtUtilizationChart({
  data,
  isLoading = false,
}: CourtUtilizationChartProps): JSX.Element {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  // Find the highest bar for peak indicator
  const highestBarIndex = data.length > 0
    ? data.reduce((maxIdx, slot, idx) => 
        slot.utilization > data[maxIdx].utilization ? idx : maxIdx, 0)
    : null;

  const showPeakIndicator = highestBarIndex !== null && data[highestBarIndex].utilization >= 70;

  if (isLoading) {
    return (
      <div
        className="rounded-xl bg-surface-container-lowest p-6"
        role="region"
        aria-label="Court utilization chart loading"
      >
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-surface-container-highest" />
        <div className="flex items-end justify-between gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="h-32 w-full animate-pulse rounded bg-surface-container-highest" />
              <div className="h-4 w-12 animate-pulse rounded bg-surface-container-highest" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-surface-container-lowest p-6 shadow-sm"
      role="region"
      aria-label="Court utilization chart"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">
            Court Utilization
          </h2>
          <p className="font-body text-sm text-on-surface-variant">
            Today's bookings across all courts
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded bg-primary"
              aria-hidden="true"
            />
            <span className="font-body text-xs text-on-surface-variant">
              Peak (70%+)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded bg-secondary"
              aria-hidden="true"
            />
            <span className="font-body text-xs text-on-surface-variant">
              High (40-69%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded bg-surface-container-highest"
              aria-hidden="true"
            />
            <span className="font-body text-xs text-on-surface-variant">
              Low (&lt;40%)
            </span>
          </div>
        </div>
      </div>

      <div
        className="relative flex h-48 items-end justify-between gap-2"
        role="img"
        aria-label="Bar chart showing court utilization by time slot"
      >
        {/* Current Peak Indicator */}
        {showPeakIndicator && highestBarIndex !== null && (
          <div 
            className="absolute -top-8 z-10"
            style={{ left: `${(highestBarIndex / data.length) * 100}%` }}
          >
            <div className="bg-surface text-white px-3 py-1 rounded text-xs font-bold whitespace-nowrap">
              Current Peak
            </div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-surface mx-auto mt-1" />
          </div>
        )}

        {data.map((slot, index) => {
          const height = getBarHeight(slot.utilization);
          const isHovered = hoveredSlot === index;

          return (
            <div
              key={slot.time}
              className="relative flex flex-1 flex-col items-center"
              onMouseEnter={() => setHoveredSlot(index)}
              onMouseLeave={() => setHoveredSlot(null)}
              role="presentation"
            >
              {/* Tooltip */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-12 z-10 rounded-lg bg-surface-container-highest px-3 py-2 shadow-lg"
                  role="tooltip"
                  aria-label={`${slot.time}: ${slot.utilization}% utilization, ${slot.bookings} bookings`}
                >
                  <p className="font-body text-xs font-bold text-on-surface">
                    {slot.utilization}%
                  </p>
                  <p className="font-body text-xs text-on-surface-variant">
                    {slot.bookings} bookings
                  </p>
                  <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-surface-container-highest" />
                </motion.div>
              )}

              {/* Bar */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${height}%`, opacity: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                className={`w-full rounded-t-md transition-all ${getBarColorClass(slot.level)}`}
                style={{ minHeight: '4px' }}
                aria-hidden="true"
              />

              {/* Time label */}
              <span
                className="mt-2 font-body text-xs font-medium text-on-surface-variant"
                aria-hidden="true"
              >
                {slot.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* X-axis label */}
      <div className="mt-4 border-t border-surface-container-highest pt-3">
        <p
          className="font-body text-xs font-medium text-on-surface-variant"
          aria-hidden="true"
        >
          Time slots (2-hour intervals)
        </p>
      </div>
    </motion.div>
  );
}

export default CourtUtilizationChart;

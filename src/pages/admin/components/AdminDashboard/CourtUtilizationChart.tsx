/**
 * CourtUtilizationChart Component - REDESIGNED
 *
 * Displays court utilization as a bar chart with 8 time slots.
 * Shows utilization percentages from 06:00 to 20:00.
 *
 * Features:
 * - 8 bars with gradient fills
 * - Y-axis labels (100%, 50%, 0%)
 * - Grid lines
 * - Hover tooltip with percentage and booking count
 * - Framer Motion animations with stagger effect
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
 * Get gradient color class for bar based on utilization level
 * Using MORE VISIBLE colors with stronger saturation
 */
function getGradientClass(level: 'low' | 'high' | 'peak'): string {
  switch (level) {
    case 'peak':
      return 'bg-gradient-to-t from-emerald-600 to-emerald-400'; // Strong green
    case 'high':
      return 'bg-gradient-to-t from-orange-600 to-orange-400'; // Strong orange
    case 'low':
      return 'bg-gradient-to-t from-gray-400 to-gray-300'; // Visible gray
  }
}

/**
 * CourtUtilizationChart component
 */
export function CourtUtilizationChart({
  data,
  isLoading = false,
}: CourtUtilizationChartProps): JSX.Element {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  // Debug log
  console.log('[CourtUtilizationChart] Received data:', data);
  console.log('[CourtUtilizationChart] Data length:', data.length);

  // Find max value for normalization (avoid division by zero)
  const maxValue = data.length > 0
    ? Math.max(...data.map((d) => d.utilization), 1)
    : 1;

  console.log('[CourtUtilizationChart] Max value:', maxValue);

  if (isLoading) {
    return (
      <div
        className="rounded-xl bg-surface-container-lowest p-6"
        role="region"
        aria-label="Court utilization chart loading"
      >
        <div className="mb-6 flex justify-between">
          <div>
            <div className="mb-2 h-6 w-48 animate-pulse rounded bg-surface-container-highest" />
            <div className="h-4 w-64 animate-pulse rounded bg-surface-container-highest" />
          </div>
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded bg-surface-container-highest" />
                <div className="h-3 w-20 animate-pulse rounded bg-surface-container-highest" />
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-64">
          <div className="flex items-end justify-between gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="h-48 w-full animate-pulse rounded bg-surface-container-highest" />
                <div className="h-4 w-12 animate-pulse rounded bg-surface-container-highest" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-surface-container-lowest p-6 shadow-sm"
      role="region"
      aria-label="Court utilization chart"
    >
      {/* Header with title and legend */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">
            Court Utilization
          </h2>
          <p className="font-body text-sm text-on-surface-variant">
            Today's bookings across all courts
          </p>
        </div>

        {/* Legend with 3 items */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded bg-gradient-to-t from-emerald-600 to-emerald-400"
              aria-hidden="true"
            />
            <span className="font-body text-xs text-on-surface-variant">
              Peak (70%+)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded bg-gradient-to-t from-orange-600 to-orange-400"
              aria-hidden="true"
            />
            <span className="font-body text-xs text-on-surface-variant">
              High (40-69%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded bg-gradient-to-t from-gray-400 to-gray-300"
              aria-hidden="true"
            />
            <span className="font-body text-xs text-on-surface-variant">
              Low (&lt;40%)
            </span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-64 flex items-end justify-between gap-3">
        {/* Y-axis labels */}
        <div
          className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-on-surface-variant"
          aria-hidden="true"
        >
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>

        {/* Grid lines */}
        <div
          className="absolute inset-0 flex flex-col justify-between pb-8"
          aria-hidden="true"
        >
          <div className="border-t border-surface-container-highest w-full" />
          <div className="border-t border-surface-container-high w-full" />
          <div className="border-t border-surface-container-highest w-full" />
        </div>

        {/* Bars */}
        {data.map((slot, index) => {
          // Calculate height in pixels (container is h-64 = 256px, minus labels/padding = ~200px usable)
          const maxBarHeight = 200; // pixels
          const barHeight = slot.utilization > 0 
            ? Math.max((slot.utilization / 100) * maxBarHeight, 32) // min 32px for visibility
            : 4; // 4px for empty slots

          const isHovered = hoveredSlot === index;

          console.log(`[CourtUtilizationChart] Slot ${slot.time}: ${slot.utilization}% -> height: ${barHeight}px`);

          return (
            <div
              key={slot.time}
              className="relative flex-1 flex flex-col items-center gap-2 group"
              onMouseEnter={() => setHoveredSlot(index)}
              onMouseLeave={() => setHoveredSlot(null)}
              role="presentation"
            >
              {/* Tooltip */}
              <div
                className={`opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 z-10 ${
                  isHovered ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                role="tooltip"
                aria-label={`${slot.time}: ${slot.utilization}% utilization, ${slot.bookings} bookings`}
              >
                <div className="bg-surface-container-highest rounded-lg px-3 py-2 shadow-lg">
                  <p className="font-bold text-on-surface">{slot.utilization}%</p>
                  <p className="text-xs text-on-surface-variant">{slot.bookings} bookings</p>
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-surface-container-highest"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Bar */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
                whileHover={{ scale: 1.05, y: -4 }}
                className={`w-full rounded-t-lg rounded-b-md ${getGradientClass(slot.level)} origin-bottom`}
                style={{ height: barHeight }}
                aria-hidden="true"
              />

              {/* Time label */}
              <span
                className="font-body text-xs font-medium text-on-surface-variant mt-auto"
                aria-hidden="true"
              >
                {slot.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* X-axis label */}
      <div className="mt-4 pt-3 border-t border-surface-container-highest">
        <p
          className="font-body text-xs text-on-surface-variant"
          aria-hidden="true"
        >
          Time slots (2-hour intervals)
        </p>
      </div>
    </motion.div>
  );
}

export default CourtUtilizationChart;

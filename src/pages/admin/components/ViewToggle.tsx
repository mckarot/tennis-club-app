/**
 * ViewToggle Component
 *
 * Toggle button for switching between Today and Weekly views.
 *
 * Features:
 * - Toggle button (Today / Weekly)
 * - Active state with primary color
 * - Framer Motion animations
 * - ARIA : role="tablist"
 *
 * @module @pages/admin/components/ViewToggle
 */

import React from 'react';
import { motion } from 'framer-motion';

export type ViewMode = 'today' | 'weekly';

export interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Reservation view mode"
      className="inline-flex rounded-lg bg-surface-container-low p-1"
    >
      {/* Today Tab */}
      <motion.button
        role="tab"
        aria-selected={viewMode === 'today'}
        aria-controls="today-view"
        id="today-tab"
        onClick={() => onViewModeChange('today')}
        className={`relative px-4 py-2 font-body text-sm font-medium transition-colors ${
          viewMode === 'today'
            ? 'text-on-primary'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {viewMode === 'today' && (
          <motion.div
            layoutId="view-toggle-active"
            className="absolute inset-0 rounded-md bg-primary"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10">Today</span>
      </motion.button>

      {/* Weekly Tab */}
      <motion.button
        role="tab"
        aria-selected={viewMode === 'weekly'}
        aria-controls="weekly-view"
        id="weekly-tab"
        onClick={() => onViewModeChange('weekly')}
        className={`relative px-4 py-2 font-body text-sm font-medium transition-colors ${
          viewMode === 'weekly'
            ? 'text-on-primary'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {viewMode === 'weekly' && (
          <motion.div
            layoutId="view-toggle-active"
            className="absolute inset-0 rounded-md bg-primary"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10">Weekly</span>
      </motion.button>
    </div>
  );
}

export default ViewToggle;

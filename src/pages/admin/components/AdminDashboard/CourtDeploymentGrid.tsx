/**
 * CourtDeploymentGrid Component
 *
 * Responsive grid layout for 6 court deployment cards.
 *
 * Features:
 * - Responsive 3-column grid
 * - 6 court cards
 * - Framer Motion animations
 * - ARIA labels for accessibility
 *
 * @module @pages/admin/components/AdminDashboard/CourtDeploymentGrid
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { CourtDeployment } from '../../../hooks/useCourtDeployment';
import { CourtDeploymentCard } from './CourtDeploymentCard';

/**
 * CourtDeploymentGrid component props
 */
export interface CourtDeploymentGridProps {
  courts: CourtDeployment[];
  onToggle: (courtId: string, isMaintenance: boolean) => Promise<void>;
  isLoading?: boolean;
}

/**
 * CourtDeploymentGrid component
 */
export function CourtDeploymentGrid({
  courts,
  onToggle,
  isLoading = false,
}: CourtDeploymentGridProps): JSX.Element {
  if (isLoading) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="grid"
        aria-label="Court deployment status loading"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl bg-surface-container-lowest"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="grid"
      aria-label="Court deployment status"
    >
      {courts.map((court, index) => (
        <motion.div
          key={court.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <CourtDeploymentCard
            court={court}
            onToggle={onToggle}
            isLoading={isLoading}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default CourtDeploymentGrid;

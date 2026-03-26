/**
 * CourtDeploymentCard Component
 *
 * Individual court card for the deployment grid.
 * Features border-l-4 color coding and maintenance toggle.
 *
 * Features:
 * - border-l-4 (primary for active, secondary for maintenance)
 * - Court number in Lexend bold ~2rem
 * - Toggle switch for maintenance state
 * - Tool icon for maintenance state
 * - Framer Motion animations
 * - ARIA labels for accessibility
 *
 * @module @pages/admin/components/AdminDashboard/CourtDeploymentCard
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { CourtDeployment } from '../../../hooks/useCourtDeployment';

/**
 * CourtDeploymentCard component props
 */
export interface CourtDeploymentCardProps {
  court: CourtDeployment;
  onToggle: (courtId: string, isMaintenance: boolean) => Promise<void>;
  isLoading?: boolean;
}

/**
 * CourtDeploymentCard component
 */
export function CourtDeploymentCard({
  court,
  onToggle,
  isLoading = false,
}: CourtDeploymentCardProps): JSX.Element {
  const isMaintenance = court.isMaintenance;

  const handleToggle = async (): Promise<void> => {
    await onToggle(court.id, !isMaintenance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md border-l-4 ${isMaintenance ? 'border-l-secondary' : 'border-l-primary'}`}
      role="article"
      aria-label={`Court ${court.number} status: ${isMaintenance ? 'Maintenance' : 'Active'}`}
    >
      {/* Status indicator bar */}
      <div
        className={`absolute right-0 top-0 h-1 w-full opacity-50 ${isMaintenance ? 'bg-secondary' : 'bg-primary'}`}
        aria-hidden="true"
      />

      <div className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3
              className="font-headline text-3xl font-bold text-on-surface"
              aria-label={`Court number ${court.number}`}
            >
              {court.number}
            </h3>
            <p className="font-body text-sm text-on-surface-variant">
              {court.name}
            </p>
          </div>

          <div
            className={`rounded-lg p-2 ${
              isMaintenance ? 'bg-secondary-fixed/20' : 'bg-primary-fixed/20'
            }`}
            aria-hidden="true"
          >
            <span
              className={`material-symbols-outlined text-2xl ${
                isMaintenance ? 'text-secondary' : 'text-primary'
              }`}
            >
              {isMaintenance ? 'build' : 'sports_tennis'}
            </span>
          </div>
        </div>

        {/* Court type badge */}
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 font-body text-xs font-semibold ${
              court.type === 'Quick'
                ? 'bg-primary-fixed/30 text-primary'
                : 'bg-secondary-fixed/30 text-secondary'
            }`}
          >
            {court.type}
          </span>
          <span className="font-body text-xs text-on-surface-variant">
            {court.surface}
          </span>
        </div>

        {/* Status row */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-sm ${
                isMaintenance ? 'text-secondary' : 'text-primary'
              }`}
              aria-hidden="true"
            >
              {isMaintenance ? 'warning' : 'check_circle'}
            </span>
            <span
              className={`font-body text-sm font-semibold ${
                isMaintenance ? 'text-secondary' : 'text-primary'
              }`}
            >
              {isMaintenance ? 'Maintenance' : 'Active'}
            </span>
          </div>

          {/* Toggle Switch */}
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleToggle}
              disabled={isLoading}
              className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                isMaintenance ? 'bg-secondary' : 'bg-primary'
              } disabled:cursor-not-allowed disabled:opacity-50`}
              role="switch"
              aria-checked={isMaintenance}
              aria-label={`Toggle maintenance state for court ${court.number}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  isMaintenance ? 'translate-x-5' : 'translate-x-0'
                }`}
                aria-hidden="true"
              />
            </button>
            <span className="font-body text-xs text-on-surface-variant font-medium">
              MAINTENANCE STATE
            </span>
          </div>
        </div>

        {/* Maintenance info */}
        {isMaintenance && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-lg bg-secondary-fixed/20 p-3"
            aria-label="Maintenance information"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-secondary">
                tools
              </span>
              <span className="font-body text-xs text-secondary">
                Maintenance mode enabled
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default CourtDeploymentCard;

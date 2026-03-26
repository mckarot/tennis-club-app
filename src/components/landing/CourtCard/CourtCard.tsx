/**
 * CourtCard Component (Landing Page)
 *
 * Individual court card for landing page with status badges (OPEN, IN PLAY, RESERVED).
 * Features Framer Motion animations, colored left border with gradient effect, and full accessibility support.
 *
 * Specifications:
 * - rounded-xl, p-6
 * - Left border: OPEN=success (green gradient), IN_PLAY=error (red gradient), RESERVED=primary (green gradient)
 * - Status badges: OPEN=success, IN_PLAY=error, RESERVED=primary
 * - Court name in uppercase (COURT 01)
 * - No image - clean minimal design
 * - Next slot time display
 * - Enhanced left bar with gradient and shadow
 *
 * @module @components/landing/CourtCard
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { LandingCourt } from '../../../utils/courtAvailability';
import { formatTime, getStatusLabel } from '../../../utils/courtAvailability';

export interface CourtCardProps {
  /** Court with availability data */
  court: LandingCourt;
  /** Click handler for booking */
  onBookClick?: (courtId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CourtCard component for landing page
 */
export function CourtCard({
  court,
  onBookClick,
  className = '',
}: CourtCardProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  // Status border color mapping with gradients
  const borderGradients: Record<typeof court.landingStatus, string> = {
    OPEN: 'bg-gradient-to-b from-success via-success to-success-container',
    IN_PLAY: 'bg-gradient-to-b from-error via-error to-error-container',
    RESERVED: 'bg-gradient-to-b from-primary via-primary to-primary-container',
  };

  // Status badge color mapping
  const statusColors: Record<typeof court.landingStatus, string> = {
    OPEN: 'bg-success-container text-on-success-container',
    IN_PLAY: 'bg-error-container text-on-error-container',
    RESERVED: 'bg-primary-container text-on-primary-container',
  };

  const statusDotColors: Record<typeof court.landingStatus, string> = {
    OPEN: 'bg-success',
    IN_PLAY: 'bg-error',
    RESERVED: 'bg-primary',
  };

  // Surface type display
  const surfaceDisplay = court.surface === 'Clay' ? 'Red Clay' : court.surface === 'Hard' ? 'Green Hard' : court.surface;

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.4,
        ease: 'easeOut',
      }}
      whileHover={{
        y: shouldReduceMotion ? 0 : -4,
        transition: { duration: 0.2 },
      }}
      className={`group relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-md transition-all duration-200 hover:shadow-2xl hover:shadow-primary/10 ${className}`}
      role="article"
      aria-label={`${court.name} - ${getStatusLabel(court.landingStatus)}`}
    >
      {/* Enhanced colored left border with gradient and glow effect */}
      <div
        className={`absolute left-0 top-0 h-full w-2 ${borderGradients[court.landingStatus]} shadow-lg`}
        style={{
          boxShadow: court.landingStatus === 'OPEN' 
            ? '0 0 12px rgba(0, 107, 63, 0.4)'
            : court.landingStatus === 'IN_PLAY'
            ? '0 0 12px rgba(186, 26, 26, 0.4)'
            : '0 0 12px rgba(0, 107, 63, 0.4)',
        }}
        aria-hidden="true"
      />

      {/* Subtle gradient overlay on hover */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-5"
        aria-hidden="true"
      />

      {/* Header with status badge */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-headline text-lg font-bold uppercase tracking-wide text-on-surface">
            Court {String(court.number).padStart(2, '0')}
          </h3>
          <p className="mt-1 font-body text-body-xs text-on-surface/60">
            {court.description}
          </p>
        </div>

        {/* Status badge */}
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${statusColors[court.landingStatus]}`}
          role="status"
          aria-label={`Status: ${getStatusLabel(court.landingStatus)}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${statusDotColors[court.landingStatus]} animate-pulse`}
            aria-hidden="true"
          />
          <span className="font-body text-body-xs font-semibold tracking-wide">
            {getStatusLabel(court.landingStatus)}
          </span>
        </div>
      </div>

      {/* Court info - simplified */}
      <div className="mb-6 space-y-3">
        {/* Next Slot */}
        <div className="flex items-center justify-between">
          <span className="font-body text-body-xs text-on-surface/60">Next Slot</span>
          <span className="font-body text-body-sm font-medium text-on-surface">
            {court.landingStatus === 'OPEN' ? 'Now' : court.nextAvailableTime ? formatTime(court.nextAvailableTime) : '—'}
          </span>
        </div>

        {/* Surface Type */}
        <div className="flex items-center justify-between">
          <span className="font-body text-body-xs text-on-surface/60">Surface Type</span>
          <span className="font-body text-body-sm text-on-surface/80">
            {surfaceDisplay}
          </span>
        </div>
      </div>

      {/* Footer - minimal, no button */}
      <div className="flex items-center justify-between border-t border-surface-container-highest pt-6">
        {/* Availability info */}
        <div className="flex items-center gap-2">
          {court.landingStatus === 'OPEN' ? (
            <span className="flex items-center gap-1.5 font-body text-body-xs text-success">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Available now</span>
            </span>
          ) : court.nextAvailableTime ? (
            <span className="flex items-center gap-1.5 font-body text-body-xs text-on-surface/70">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Ends at {formatTime(court.nextAvailableTime)}</span>
            </span>
          ) : (
            <span className="font-body text-body-xs text-on-surface/60">
              Check schedule
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default CourtCard;

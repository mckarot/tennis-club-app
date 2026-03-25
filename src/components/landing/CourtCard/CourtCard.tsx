/**
 * CourtCard Component (Landing Page)
 *
 * Individual court card for landing page with status badges (OPEN, IN PLAY, RESERVED).
 * Features Framer Motion animations and full accessibility support.
 *
 * Specifications:
 * - rounded-xl, p-8
 * - Status badges: OPEN=success, IN_PLAY=error, RESERVED=primary
 * - Court image, type, surface info
 * - Next available time display
 *
 * @module @components/landing/CourtCard
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { LandingCourt } from '../../../utils/courtAvailability';
import { formatTime, getStatusBadgeVariant, getStatusLabel } from '../../../utils/courtAvailability';

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
  const badgeVariant = getStatusBadgeVariant(court.landingStatus);

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
      className={`group rounded-xl bg-surface-container-lowest p-8 shadow-sm transition-shadow duration-200 hover:shadow-xl ${className}`}
      role="article"
      aria-label={`${court.name} - ${getStatusLabel(court.landingStatus)}`}
    >
      {/* Header with status badge */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-headline text-headline-lg font-semibold text-on-surface">
            {court.name}
          </h3>
          <p className="mt-1 font-body text-body-sm text-on-surface/60">
            Terrain {court.number}
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

      {/* Court image */}
      {court.image ? (
        <div className="mb-6 overflow-hidden rounded-xl">
          <div className="relative h-48 w-full">
            <img
              src={court.image}
              alt={court.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Overlay gradient */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
              aria-hidden="true"
            />
          </div>
        </div>
      ) : (
        <div className="mb-6 flex h-48 items-center justify-center rounded-xl bg-surface-container-highest">
          <span className="material-symbols-outlined text-6xl text-on-surface/30">
            sports_tennis
          </span>
        </div>
      )}

      {/* Court info */}
      <div className="mb-6 flex items-center gap-4">
        {/* Type */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface/60">
            sports_tennis
          </span>
          <span className="font-body text-body-sm text-on-surface/80">
            {court.type}
          </span>
        </div>

        {/* Surface */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface/60">
            landscape
          </span>
          <span className="font-body text-body-sm text-on-surface/80">
            {court.surface}
          </span>
        </div>
      </div>

      {/* Description */}
      {court.description && (
        <p className="mb-6 font-body text-body text-on-surface/80">
          {court.description}
        </p>
      )}

      {/* Footer with availability and CTA */}
      <div className="flex items-center justify-between border-t border-surface-container-highest pt-6">
        {/* Availability info */}
        <div className="flex items-center gap-2">
          {court.landingStatus === 'OPEN' ? (
            <span className="flex items-center gap-2 font-body text-body-sm text-success">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Available now</span>
            </span>
          ) : court.nextAvailableTime ? (
            <span className="flex items-center gap-2 font-body text-body-sm text-on-surface/80">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Next: {formatTime(court.nextAvailableTime)}</span>
            </span>
          ) : (
            <span className="font-body text-body-sm text-on-surface/60">
              Check schedule
            </span>
          )}
        </div>

        {/* Book button */}
        {onBookClick && (
          <button
            onClick={() => onBookClick(court.id)}
            disabled={court.landingStatus === 'IN_PLAY'}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-body text-body-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest ${
              court.landingStatus === 'IN_PLAY'
                ? 'cursor-not-allowed bg-surface-container-highest text-on-surface/40'
                : 'bg-primary text-on-primary hover:bg-primary-container active:scale-95'
            }`}
            aria-label={`Book ${court.name}`}
            aria-disabled={court.landingStatus === 'IN_PLAY'}
          >
            <span>Book</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default CourtCard;

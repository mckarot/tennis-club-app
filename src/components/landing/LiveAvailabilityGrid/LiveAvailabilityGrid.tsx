/**
 * LiveAvailabilityGrid Component
 *
 * Grid display of 6 courts with real-time availability status.
 * Features responsive grid layout (1/2/3 columns) and loading states.
 *
 * Specifications:
 * - grid-cols-1 md:grid-cols-2 lg:grid-cols-3
 * - gap-8
 * - Section header with icon
 * - Loading skeleton state
 * - Empty state handling
 *
 * @module @components/landing/LiveAvailabilityGrid
 */

import { motion, useReducedMotion } from 'framer-motion';
import { CourtCard } from '../CourtCard/CourtCard';
import type { LandingCourt } from '../../../utils/courtAvailability';

export interface LiveAvailabilityGridProps {
  /** Courts with availability data */
  courts: LandingCourt[];
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
  /** Click handler for booking */
  onBookClick?: (courtId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * LiveAvailabilityGrid component
 */
export function LiveAvailabilityGrid({
  courts,
  isLoading = false,
  error = null,
  onBookClick,
  className = '',
}: LiveAvailabilityGridProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  // Loading skeleton
  if (isLoading) {
    return (
      <section
        aria-label="Court availability loading"
        className={className}
      >
        {/* Section header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed">
              <span className="material-symbols-outlined text-3xl text-primary">
                sports_tennis
              </span>
            </div>
          </div>
          <h2 className="font-headline text-headline-xl font-bold text-on-surface">
            Live Court Availability
          </h2>
          <p className="mt-3 font-body text-body-lg text-on-surface/70">
            Real-time status of all courts
          </p>
        </div>

        {/* Loading grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.3,
                delay: shouldReduceMotion ? 0 : index * 0.1,
              }}
              className="rounded-xl bg-surface-container-lowest p-8"
              aria-hidden="true"
            >
              {/* Skeleton header */}
              <div className="mb-6 flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-32 animate-pulse rounded bg-surface-container-highest" />
                  <div className="h-4 w-20 animate-pulse rounded bg-surface-container-highest" />
                </div>
                <div className="h-8 w-24 animate-pulse rounded-full bg-surface-container-highest" />
              </div>

              {/* Skeleton image */}
              <div className="mb-6 h-48 animate-pulse rounded-xl bg-surface-container-highest" />

              {/* Skeleton info */}
              <div className="mb-6 flex gap-4">
                <div className="h-5 w-20 animate-pulse rounded bg-surface-container-highest" />
                <div className="h-5 w-20 animate-pulse rounded bg-surface-container-highest" />
              </div>

              {/* Skeleton footer */}
              <div className="flex items-center justify-between border-t border-surface-container-highest pt-6">
                <div className="h-5 w-24 animate-pulse rounded bg-surface-container-highest" />
                <div className="h-10 w-20 animate-pulse rounded-lg bg-surface-container-highest" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section
        aria-label="Court availability error"
        className={className}
      >
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-surface-container p-8 text-center">
          <span className="material-symbols-outlined text-6xl text-error">
            error
          </span>
          <h3 className="mt-4 font-headline text-headline-md font-semibold text-on-surface">
            Unable to load courts
          </h3>
          <p className="mt-2 font-body text-body text-on-surface/70">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </section>
    );
  }

  // Empty state
  if (courts.length === 0) {
    return (
      <section
        aria-label="No courts available"
        className={className}
      >
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-surface-container p-8 text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface/40">
            sports_tennis
          </span>
          <h3 className="mt-4 font-headline text-headline-md font-semibold text-on-surface">
            No courts available
          </h3>
          <p className="mt-2 font-body text-body text-on-surface/70">
            Please check back later
          </p>
        </div>
      </section>
    );
  }

  // Success state - render courts grid
  return (
    <section
      aria-label="Court availability"
      className={className}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
        className="mb-12 text-center"
      >
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed">
            <span className="material-symbols-outlined text-3xl text-primary">
              sports_tennis
            </span>
          </div>
        </div>
        <h2 className="font-headline text-headline-xl font-bold text-on-surface">
          Live Court Availability
        </h2>
        <p className="mt-3 font-body text-body-lg text-on-surface/70">
          Real-time status of all {courts.length} courts
        </p>
      </motion.div>

      {/* Courts grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {courts.map((court, index) => (
          <CourtCard
            key={court.id}
            court={court}
            onBookClick={onBookClick}
          />
        ))}
      </div>
    </section>
  );
}

export default LiveAvailabilityGrid;

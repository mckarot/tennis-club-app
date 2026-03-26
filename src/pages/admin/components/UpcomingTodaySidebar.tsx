/**
 * UpcomingTodaySidebar Component
 *
 * Right sidebar displaying today's upcoming reservations.
 *
 * Features:
 * - Sidebar droite (300px width)
 * - Liste cartes réservations du jour
 * - Tri par start_time
 * - Empty state si aucune réservation
 * - Framer Motion animations
 * - ARIA : role="complementary"
 *
 * @module @pages/admin/components/UpcomingTodaySidebar
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { Reservation } from '../../../types/reservation.types';
import type { Court } from '../../../types/court.types';
import type { User } from '../../../types/user.types';
import { UpcomingReservationCard } from './UpcomingReservationCard';

export interface UpcomingTodaySidebarProps {
  reservations: Reservation[];
  users?: Map<string, User>;
  courts?: Map<string, Court>;
  isLoading?: boolean;
  onEdit?: (reservation: Reservation) => void;
  onCancel?: (reservation: Reservation) => void;
  onComplete?: (reservation: Reservation) => void;
}

/**
 * Skeleton card for loading state
 */
function SidebarCardSkeleton() {
  return (
    <div
      className="rounded-lg bg-surface-container-low p-4 shadow-sm"
      aria-hidden="true"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-5 animate-pulse rounded bg-surface-container-highest" />
        <div className="h-4 w-24 animate-pulse rounded bg-surface-container-highest" />
      </div>
      <div className="mb-2 h-5 w-32 animate-pulse rounded bg-surface-container-highest" />
      <div className="mb-3 h-4 w-20 animate-pulse rounded bg-surface-container-highest" />
      <div className="flex justify-between">
        <div className="h-6 w-20 animate-pulse rounded-full bg-surface-container-highest" />
        <div className="h-4 w-16 animate-pulse rounded bg-surface-container-highest" />
      </div>
    </div>
  );
}

export function UpcomingTodaySidebar({
  reservations,
  users,
  courts,
  isLoading = false,
  onEdit,
  onCancel,
  onComplete,
}: UpcomingTodaySidebarProps) {
  // Sort reservations by start_time
  const sortedReservations = [...reservations].sort((a, b) => {
    const aTime = a.start_time.toMillis();
    const bTime = b.start_time.toMillis();
    return aTime - bTime;
  });

  return (
    <aside
      role="complementary"
      aria-label="Today's upcoming reservations"
      className="w-full lg:w-[300px]"
    >
      <motion.div
        className="sticky top-6 rounded-xl bg-surface-container p-4 shadow-sm"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-4 flex items-center gap-2 border-b border-outline/20 pb-4">
          <span className="material-symbols-outlined text-primary">
            event_today
          </span>
          <h2 className="font-headline text-lg font-bold text-on-surface">
            Today's Reservations
          </h2>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeletons
            <>
              <SidebarCardSkeleton />
              <SidebarCardSkeleton />
              <SidebarCardSkeleton />
            </>
          ) : sortedReservations.length === 0 ? (
            // Empty state
            <motion.div
              className="py-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="material-symbols-outlined mx-block mb-3 text-4xl text-on-surface-variant">
                event_busy
              </span>
              <p className="font-body text-sm text-on-surface-variant">
                No reservations for today
              </p>
            </motion.div>
          ) : (
            // Reservation cards
            sortedReservations.map((reservation, index) => {
              const user = users?.get(reservation.user_id);
              const court = courts?.get(reservation.court_id);

              return (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <UpcomingReservationCard
                    reservation={reservation}
                    userName={user?.name}
                    courtName={court?.name}
                    courtNumber={court?.number}
                    onEdit={onEdit}
                    onCancel={onCancel}
                    onComplete={onComplete}
                  />
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer: Total count */}
        {!isLoading && sortedReservations.length > 0 && (
          <motion.div
            className="mt-4 flex items-center justify-between border-t border-outline/20 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <span className="font-body text-sm text-on-surface-variant">
              Total reservations
            </span>
            <span className="font-headline text-lg font-bold text-primary">
              {sortedReservations.length}
            </span>
          </motion.div>
        )}
      </motion.div>
    </aside>
  );
}

export default UpcomingTodaySidebar;

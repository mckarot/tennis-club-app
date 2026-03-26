/**
 * ReservationsCalendar Component
 *
 * Calendar grid displaying reservations by court and time slot.
 *
 * Features:
 * - Grille 5 colonnes (courts 1-5) × lignes horaires (06:00-22:00)
 * - Toggle View Today/Weekly
 * - Appelle ReservationCell pour chaque créneau
 * - Loading skeleton
 * - Framer Motion animations
 * - ARIA : role="grid"
 *
 * @module @pages/admin/components/ReservationsCalendar
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import type { Reservation } from '../../../types/reservation.types';
import type { Court } from '../../../types/court.types';
import type { User } from '../../../types/user.types';
import type { ViewMode } from './ViewToggle';
import { ReservationCell } from './ReservationCell';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface ReservationsCalendarProps {
  reservations: Reservation[];
  courts?: Map<string, Court>;
  users?: Map<string, User>;
  viewMode: ViewMode;
  isLoading?: boolean;
  onEdit?: (reservation: Reservation) => void;
  onCancel?: (reservation: Reservation) => void;
  onComplete?: (reservation: Reservation) => void;
}

// ==========================================
// CONSTANTS
// ==========================================

/**
 * Operating hours (06:00 - 22:00)
 */
const START_HOUR = 6;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

/**
 * Number of courts
 */
const COURT_COUNT = 5;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Format hour to HH:MM
 */
function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

/**
 * Get date for view mode
 */
function getTargetDate(viewMode: ViewMode): Date {
  const now = new Date();
  if (viewMode === 'today') {
    return now;
  }
  // For weekly, return start of week (Monday)
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff));
}

/**
 * Check if reservation starts in this hour slot
 */
function isReservationStartInHour(reservation: Reservation, hour: number, targetDate: Date): boolean {
  const reservationStart = reservation.start_time.toDate();
  const slotStart = new Date(targetDate);
  slotStart.setHours(hour, 0, 0, 0);

  return (
    reservationStart.getDate() === slotStart.getDate() &&
    reservationStart.getMonth() === slotStart.getMonth() &&
    reservationStart.getFullYear() === slotStart.getFullYear() &&
    reservationStart.getHours() === hour
  );
}

// ==========================================
// SKELETON COMPONENT
// ==========================================

function CalendarSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-sm">
      {/* Header */}
      <div className="grid grid-cols-6 border-b border-outline/20">
        <div className="p-4" />
        {Array.from({ length: COURT_COUNT }).map((_, i) => (
          <div key={i} className="p-4 text-center">
            <div className="mx-auto h-4 w-16 animate-pulse rounded bg-surface-container-highest" />
          </div>
        ))}
      </div>
      {/* Time slots */}
      {HOURS.slice(0, 5).map((hour) => (
        <div key={hour} className="grid grid-cols-6 border-t border-outline/10">
          <div className="p-4">
            <div className="h-4 w-12 animate-pulse rounded bg-surface-container-highest" />
          </div>
          {Array.from({ length: COURT_COUNT }).map((_, j) => (
            <div key={j} className="border-l border-outline/10 p-2">
              <div className="h-16 animate-pulse rounded bg-surface-container-highest" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ReservationsCalendar({
  reservations,
  courts,
  users,
  viewMode,
  isLoading = false,
  onEdit,
  onCancel,
  onComplete,
}: ReservationsCalendarProps) {
  const targetDate = getTargetDate(viewMode);

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  // Get court IDs (or generate placeholder IDs)
  const courtIds = courts
    ? Array.from(courts.keys()).slice(0, COURT_COUNT)
    : Array.from({ length: COURT_COUNT }).map((_, i) => `court-${i + 1}`);

  return (
    <motion.div
      role="grid"
      aria-label="Reservations calendar"
      className="overflow-hidden rounded-xl bg-surface-container-low shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Calendar Header */}
      <div className="grid grid-cols-6 border-b border-outline/20 bg-surface-container-high">
        {/* Time column header */}
        <div className="p-4 font-body text-sm font-semibold text-on-surface-variant">
          Time
        </div>
        {/* Court headers */}
        {courtIds.map((courtId, index) => {
          const court = courts?.get(courtId);
          return (
            <div key={courtId} className="p-4 text-center">
              <span className="font-body text-sm font-semibold text-on-surface">
                Court {court?.number || index + 1}
              </span>
              {court?.name && (
                <p className="font-body text-xs text-on-surface-variant">{court.name}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="max-h-[600px] overflow-y-auto">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-6 border-t border-outline/10"
            role="row"
            aria-label={`Hour ${formatHour(hour)}`}
          >
            {/* Time label */}
            <div
              className="border-r border-outline/10 p-2 font-body text-xs text-on-surface-variant"
              role="rowheader"
            >
              {formatHour(hour)}
            </div>

            {/* Court cells */}
            {courtIds.map((courtId) => {
              // Find reservations that start in this hour slot for this court
              const cellReservations = reservations.filter(
                (res) =>
                  res.court_id === courtId &&
                  isReservationStartInHour(res, hour, targetDate)
              );

              return (
                <div
                  key={courtId}
                  className="border-l border-outline/10 p-1"
                  role="gridcell"
                  aria-label={`Court ${courtId} at ${formatHour(hour)}`}
                >
                  {cellReservations.length > 0 ? (
                    <div className="h-full">
                      {cellReservations.map((reservation) => {
                        const user = users?.get(reservation.user_id);
                        const moniteur = reservation.moniteur_id
                          ? users?.get(reservation.moniteur_id)
                          : undefined;
                        const court = courts?.get(courtId);

                        return (
                          <div key={reservation.id} className="mb-1 last:mb-0">
                            <ReservationCell
                              reservation={reservation}
                              userName={user?.name}
                              moniteurName={moniteur?.name}
                              courtName={court?.name}
                              onEdit={onEdit}
                              onCancel={onCancel}
                              onComplete={onComplete}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[60px] items-center justify-center text-on-surface-variant/30">
                      <span className="material-symbols-outlined text-sm">
                        event_busy
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default ReservationsCalendar;

/**
 * TimeSlotGrid Component
 *
 * Interactive time slot grid for court booking.
 * Displays 7 columns (days) × 8+ rows (time slots) with h-16 cells.
 *
 * Color scheme per PNG audit:
 * - Confirmed Quick: bg-primary (#0A6B4E)
 * - Confirmed Terre: bg-secondary (#9C4A2A)
 * - Available: bg-surface-container-high (#E8EDE8)
 *
 * @module @components/reservations/TimeSlotGrid
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { Court, CourtType } from '../../types/court.types';
import type { Reservation } from '../../types/reservation.types';

export interface TimeSlotGridProps {
  courts: Court[];
  reservations: Reservation[];
  startDate: Date;
  onSlotSelect: (court: Court, date: Date, hour: number) => void;
  isLoading?: boolean;
  startHour?: number;
  endHour?: number;
}

export interface GridCell {
  court: Court;
  date: Date;
  hour: number;
  isAvailable: boolean;
  isConfirmed: boolean;
  isPending: boolean;
  isMaintenance: boolean;
  reservation?: Reservation;
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const DAYS = 7;

/**
 * Format hour for display
 */
function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  });
}

/**
 * Check if a time slot is occupied by a reservation
 *
 * Includes validation for reservation data to handle potential Firestore inconsistencies.
 */
function isSlotOccupied(
  courtId: string,
  date: Date,
  hour: number,
  reservations: Reservation[]
): { isOccupied: boolean; reservation?: Reservation; isPending: boolean } {
  const dateStart = new Date(date);
  dateStart.setHours(hour, 0, 0, 0);

  const dateEnd = new Date(date);
  dateEnd.setHours(hour + 1, 0, 0, 0);

  for (const reservation of reservations) {
    if (reservation.court_id !== courtId) continue;
    if (reservation.status === 'cancelled') continue;
    if (reservation.status === 'maintenance') continue;

    // Validate reservation timestamps
    try {
      if (!reservation.start_time || !reservation.end_time) {
        console.warn('[TimeSlotGrid] Invalid reservation: missing timestamps', reservation.id);
        continue;
      }

      const resStart = reservation.start_time.toDate();
      const resEnd = reservation.end_time.toDate();

      // Check if reservation overlaps with this hour slot
      const overlaps = resStart < dateEnd && resEnd > dateStart;

      if (overlaps) {
        return {
          isOccupied: reservation.status === 'confirmed',
          reservation,
          isPending: reservation.status === 'pending' || reservation.status === 'pending_payment',
        };
      }
    } catch (error) {
      console.error('[TimeSlotGrid] Invalid reservation data:', error, reservation.id);
      // Skip invalid reservation and continue with next
      continue;
    }
  }

  return { isOccupied: false, isPending: false };
}

/**
 * Get cell style based on state and court type
 */
function getCellStyle(
  isAvailable: boolean,
  isConfirmed: boolean,
  isPending: boolean,
  isMaintenance: boolean,
  courtType: CourtType
): string {
  if (isMaintenance) {
    return 'bg-surface-dim/40 border-dashed border-surface-container-highest text-on-surface/40 cursor-not-allowed';
  }

  if (isConfirmed) {
    if (courtType === 'Terre') {
      return 'bg-secondary text-on-secondary hover:scale-105 cursor-pointer';
    }
    return 'bg-primary text-on-primary hover:scale-105 cursor-pointer';
  }

  if (isPending) {
    return 'bg-primary/50 text-on-primary hover:scale-105 cursor-pointer';
  }

  return 'bg-surface-container-high hover:border-primary/30 border border-surface-container-highest text-on-surface cursor-pointer';
}

export function TimeSlotGrid({
  courts,
  reservations,
  startDate,
  onSlotSelect,
  isLoading = false,
  startHour = 8,
  endHour = 20,
}: TimeSlotGridProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();

  const hours = HOURS.filter((h) => h >= startHour && h < endHour);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 4 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.15 },
    },
  };

  const generateDates = (): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < DAYS; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12" role="status" aria-label="Loading">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="overflow-x-auto"
      role="grid"
      aria-label="Time slot grid for court booking"
    >
      <div className="min-w-max">
        {/* 
          Grid structure: TimeColumn + (Day × (Court × Hours))
          - Column 1: Time labels (80px)
          - Columns 2-8: Days (7 days × 160px each)
          - Each day contains court cells for all hours
        */}
        {/* Header Row - Days */}
        <div className="grid grid-cols-[80px_repeat(7,160px)] gap-2 mb-2">
          <div className="col-start-1 row-start-1" />
          {dates.map((date, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center p-2 bg-surface-container-low rounded-lg"
              style={{ gridColumnStart: index + 2 }}
            >
              <div className="font-body text-body-xs text-on-surface-variant uppercase">
                {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
              </div>
              <div className="font-headline text-lg font-bold text-on-surface">
                {date.getDate()}
              </div>
              <div className="font-body text-body-xs text-on-surface-variant">
                {date.toLocaleDateString('fr-FR', { month: 'short' })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Time Slots Grid */}
        <div className="grid grid-cols-[80px_repeat(7,160px)] gap-2">
          {hours.map((hour, rowIndex) => (
            <>
              {/* Time Label */}
              <motion.div
                key={`time-${hour}`}
                variants={itemVariants}
                className="flex items-center justify-center font-body text-body-sm font-medium text-on-surface-variant"
                style={{ gridRow: rowIndex + 2 }}
              >
                {formatHour(hour)}
              </motion.div>

              {/* Court Cells for each day */}
              {dates.map((date, colIndex) => {
                const cellKey = `${date.toISOString()}-${hour}`;

                return courts.map((court, courtIndex) => {
                  const { isOccupied, reservation, isPending } = isSlotOccupied(
                    court.id,
                    date,
                    hour,
                    reservations
                  );

                  const isMaintenance = court.status === 'maintenance' || !court.is_active;
                  const isAvailable = !isOccupied && !isMaintenance;
                  const isConfirmed = isOccupied && !isPending;

                  const cellStyle = getCellStyle(
                    isAvailable,
                    isConfirmed,
                    isPending,
                    isMaintenance,
                    court.type
                  );

                  const isInteractive = isAvailable && !isLoading;

                  return (
                    <motion.button
                      key={`${cellKey}-${court.id}`}
                      variants={itemVariants}
                      onClick={() => {
                        if (isInteractive) {
                          onSlotSelect(court, date, hour);
                        }
                      }}
                      disabled={!isInteractive}
                      aria-label={`${formatHour(hour)} - ${court.name} - ${
                        isAvailable ? 'Available' : isConfirmed ? 'Booked' : 'Unavailable'
                      }`}
                      className={`
                        h-16 rounded-lg flex flex-col items-center justify-center gap-1
                        transition-all duration-200
                        ${cellStyle}
                        ${isInteractive ? 'focus:outline-none focus:ring-2 focus:ring-primary/50' : ''}
                      `}
                      style={{ gridRow: rowIndex + 2, gridColumnStart: colIndex + 2 }}
                    >
                      <span className="font-body text-label font-semibold">
                        {formatHour(hour)}
                      </span>

                      {isAvailable && (
                        <span className="material-symbols-outlined text-xs opacity-60">
                          sports_tennis
                        </span>
                      )}

                      {isConfirmed && (
                        <span className="material-symbols-outlined text-xs">
                          check_circle
                        </span>
                      )}

                      {isPending && (
                        <span className="material-symbols-outlined text-xs">
                          schedule
                        </span>
                      )}

                      {isMaintenance && (
                        <span className="material-symbols-outlined text-xs">
                          build
                        </span>
                      )}
                    </motion.button>
                  );
                });
              })}
            </>
          ))}
        </div>
      </div>

      {/* Mobile scroll hint */}
      <div className="flex items-center justify-center gap-2 mt-4 text-on-surface/40 lg:hidden">
        <span className="material-symbols-outlined text-sm">swipe</span>
        <span className="font-body text-body-sm">Faites défiler pour voir plus</span>
      </div>
    </motion.div>
  );
}

export default TimeSlotGrid;

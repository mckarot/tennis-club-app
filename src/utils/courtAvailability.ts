/**
 * Court Availability Utils
 *
 * Pure functions for calculating court availability status.
 * Used by landing page components to display real-time court status.
 *
 * @module @utils/courtAvailability
 */

import type { Court } from '../types/court.types';
import type { Reservation } from '../types/reservation.types';
import type { Timestamp } from 'firebase/firestore';

/**
 * Court availability status for landing page display
 */
export type LandingCourtStatus = 'OPEN' | 'IN_PLAY' | 'RESERVED';

/**
 * Court with landing page availability information
 */
export interface LandingCourt extends Court {
  landingStatus: LandingCourtStatus;
  nextAvailableTime?: Date;
}

/**
 * Get current time in America/Martinique timezone
 */
export function getCurrentTimeInMartinique(): Date {
  const now = new Date();
  const martiniqueOffset = -4 * 60; // UTC-4 in minutes
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcTime + martiniqueOffset * 60000);
}

/**
 * Convert Firestore Timestamp to Date
 */
export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

/**
 * Determine court status based on current time and reservations
 *
 * Logic:
 * - OPEN: Court is active and no current reservation
 * - IN_PLAY: Court has a reservation that is currently active (now is between start and end)
 * - RESERVED: Court has an upcoming reservation but not currently active
 */
export function determineCourtStatus(
  court: Court,
  reservations: Reservation[]
): LandingCourtStatus {
  // If court is not active, it's closed
  if (!court.is_active || court.status === 'closed' || court.status === 'maintenance') {
    return 'RESERVED';
  }

  const now = getCurrentTimeInMartinique();
  const nowTime = now.getTime();

  // Sort reservations by start time
  const sortedReservations = [...reservations].sort(
    (a, b) => timestampToDate(a.start_time).getTime() - timestampToDate(b.start_time).getTime()
  );

  // Find current and upcoming reservations
  for (const reservation of sortedReservations) {
    // Skip cancelled reservations
    if (reservation.status === 'cancelled') {
      continue;
    }

    const startTime = timestampToDate(reservation.start_time).getTime();
    const endTime = timestampToDate(reservation.end_time).getTime();

    // Check if reservation is currently active
    if (nowTime >= startTime && nowTime < endTime) {
      return 'IN_PLAY';
    }

    // Check if reservation is upcoming (within next 2 hours)
    const twoHoursFromNow = nowTime + 2 * 60 * 60 * 1000;
    if (nowTime < startTime && startTime <= twoHoursFromNow) {
      return 'RESERVED';
    }
  }

  return 'OPEN';
}

/**
 * Get next available time for a court
 */
export function getNextAvailableTime(
  court: Court,
  reservations: Reservation[]
): Date | undefined {
  if (!court.is_active) {
    return undefined;
  }

  const now = getCurrentTimeInMartinique();
  const nowTime = now.getTime();

  // Sort reservations by start time
  const sortedReservations = [...reservations].sort(
    (a, b) => timestampToDate(a.start_time).getTime() - timestampToDate(b.start_time).getTime()
  );

  // Find the next available slot
  for (const reservation of sortedReservations) {
    // Skip cancelled reservations
    if (reservation.status === 'cancelled') {
      continue;
    }

    const endTime = timestampToDate(reservation.end_time).getTime();

    // If reservation ends in the future, that's the next available time
    if (endTime > nowTime) {
      return new Date(endTime);
    }
  }

  // Court is currently available
  return now;
}

/**
 * Enhance courts with landing page availability information
 */
export function enhanceCourtsWithAvailability(
  courts: Court[],
  reservations: Reservation[]
): LandingCourt[] {
  return courts.map((court) => {
    const courtReservations = reservations.filter(
      (r) => r.court_id === court.id
    );

    const landingStatus = determineCourtStatus(court, courtReservations);
    const nextAvailableTime = getNextAvailableTime(court, courtReservations);

    return {
      ...court,
      landingStatus,
      nextAvailableTime: landingStatus === 'OPEN' ? undefined : nextAvailableTime,
    };
  });
}

/**
 * Get status badge variant based on court status
 */
export function getStatusBadgeVariant(
  status: LandingCourtStatus
): 'success' | 'error' | 'primary' {
  switch (status) {
    case 'OPEN':
      return 'success';
    case 'IN_PLAY':
      return 'error';
    case 'RESERVED':
      return 'primary';
    default:
      return 'primary';
  }
}

/**
 * Format time for display (HH:MM)
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Martinique',
  });
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: LandingCourtStatus): string {
  switch (status) {
    case 'OPEN':
      return 'OPEN';
    case 'IN_PLAY':
      return 'IN PLAY';
    case 'RESERVED':
      return 'RESERVED';
    default:
      return status;
  }
}

/**
 * Dashboard Service
 *
 * Service layer for Client Dashboard operations including:
 * - Upcoming reservations for a user
 * - Court reservations by date (for grid display)
 * - Active maintenance notes
 * - Dashboard statistics
 *
 * All operations use try/catch for error handling and the Firebase singleton pattern.
 * Timezone: America/Martinique (AST, UTC-4)
 *
 * @module @services/dashboardService
 */

import { getDbInstance } from '../config/firebase.config';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  getDoc,
  Timestamp,
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore';
import type { Court, CourtType } from '../types/court.types';
import type { Reservation, ReservationStatus } from '../types/reservation.types';
import type {
  DashboardStats,
  MaintenanceNote,
  UpcomingReservation,
  CourtGridCell,
  CourtCellState,
} from '../types/client-dashboard.types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = 'America/Martinique';
const db = getDbInstance();

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * Service result pattern for type-safe error handling
 */
export interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Court grid configuration for Client Dashboard
 */
export interface CourtGridConfig {
  totalCourts: number;
  totalRows: number;
  startHour: number;
  endHour: number;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Map Firestore document data to Court type safely
 */
function mapToCourt(docId: string, data: Record<string, unknown>): Court {
  return {
    id: docId,
    number: data.number as number,
    name: data.name as string,
    type: data.type as CourtType,
    surface: data.surface as string as Court['surface'],
    status: data.status as Court['status'],
    is_active: data.is_active as boolean,
    image: data.image as string | undefined,
    description: data.description as string | undefined,
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
  };
}

/**
 * Map Firestore document data to Reservation type safely
 */
function mapToReservation(docId: string, data: Record<string, unknown>): Reservation {
  return {
    id: docId,
    court_id: data.court_id as string,
    user_id: data.user_id as string,
    moniteur_id: data.moniteur_id as string | undefined,
    start_time: data.start_time as Timestamp,
    end_time: data.end_time as Timestamp,
    type: data.type as Reservation['type'],
    status: data.status as Reservation['status'],
    title: data.title as string | undefined,
    description: data.description as string | undefined,
    participants: data.participants as number | undefined,
    is_paid: data.is_paid as boolean | undefined,
    created_at: data.created_at as Timestamp,
    updated_at: data.updated_at as Timestamp | undefined,
  };
}

/**
 * Map Firestore document data to MaintenanceNote type safely
 */
function mapToMaintenanceNote(docId: string, data: Record<string, unknown>): MaintenanceNote {
  return {
    id: docId,
    title: data.title as string,
    message: data.message as string,
    severity: data.severity as 'info' | 'warning' | 'urgent',
    is_active: data.is_active as boolean,
    createdAt: data.created_at as Timestamp,
    expiresAt: data.expires_at as Timestamp | undefined,
    affectedCourts: data.affected_courts as string[] | undefined,
  };
}

/**
 * Determine court cell state based on reservation status
 */
function getCellStateFromReservation(reservation: Reservation | null): CourtCellState {
  if (!reservation) {
    return 'available';
  }

  switch (reservation.status) {
    case 'confirmed':
      return 'confirmed';
    case 'pending':
    case 'pending_payment':
      return 'pending';
    case 'cancelled':
      return 'available';
    case 'completed':
      return 'available';
    default:
      return 'available';
  }
}

// ==========================================
// UPCOMING RESERVATIONS
// ==========================================

/**
 * Get upcoming reservations for a user
 *
 * Query: Get user's reservations filtered by future dates, sorted by start_time
 * Index used: reservations:user_id+start_time
 *
 * @param userId - User ID to fetch reservations for
 * @param limitCount - Maximum number of reservations to return (default: 10)
 * @returns Promise resolving to ServiceResult with upcoming reservations
 */
export async function getUpcomingReservations(
  userId: string,
  limitCount: number = 10
): Promise<ServiceResult<UpcomingReservation[]>> {
  try {
    const now = Timestamp.now();

    // Query: Get user's future reservations sorted by start_time
    // Uses index: reservations:user_id+start_time
    const q = query(
      collection(db, 'reservations'),
      where('user_id', '==', userId),
      where('start_time', '>=', now),
      orderBy('start_time', 'asc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    // Fetch court details for each reservation
    const reservations: UpcomingReservation[] = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const reservation = mapToReservation(docSnap.id, docSnap.data() as Record<string, unknown>);

        // Fetch court details
        const courtDoc = await getDoc(doc(db, 'courts', reservation.court_id));
        const court = courtDoc.exists() ? mapToCourt(courtDoc.id, courtDoc.data() as Record<string, unknown>) : null;

        // Fetch user name (for display purposes)
        const userDoc = await getDoc(doc(db, 'users', reservation.user_id));
        const userName = userDoc.exists() ? (userDoc.data().name as string) : 'Unknown User';

        return {
          id: reservation.id!,
          courtId: reservation.court_id,
          courtNumber: court?.number || 0,
          courtType: court?.type || 'Quick',
          userId: reservation.user_id,
          userName,
          startTime: reservation.start_time,
          endTime: reservation.end_time,
          status: reservation.status,
          type: reservation.type as UpcomingReservation['type'],
        };
      })
    );

    return {
      success: true,
      data: reservations,
    };
  } catch (error) {
    console.error('[getUpcomingReservations] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch upcoming reservations',
    };
  }
}

/**
 * Subscribe to user's upcoming reservations with real-time updates
 *
 * @param userId - User ID to subscribe to reservations for
 * @param callback - Callback function invoked on snapshot updates
 * @param errorCallback - Optional error callback
 * @returns Unsubscribe function to clean up the listener
 */
export function subscribeToUpcomingReservations(
  userId: string,
  callback: (reservations: UpcomingReservation[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  try {
    const now = Timestamp.now();

    const q = query(
      collection(db, 'reservations'),
      where('user_id', '==', userId),
      where('start_time', '>=', now),
      orderBy('start_time', 'asc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const reservations: UpcomingReservation[] = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const reservation = mapToReservation(docSnap.id, docSnap.data() as Record<string, unknown>);

              const courtDoc = await getDoc(doc(db, 'courts', reservation.court_id));
              const court = courtDoc.exists()
                ? mapToCourt(courtDoc.id, courtDoc.data() as Record<string, unknown>)
                : null;

              const userDoc = await getDoc(doc(db, 'users', reservation.user_id));
              const userName = userDoc.exists() ? (userDoc.data().name as string) : 'Unknown User';

              return {
                id: reservation.id!,
                courtId: reservation.court_id,
                courtNumber: court?.number || 0,
                courtType: court?.type || 'Quick',
                userId: reservation.user_id,
                userName,
                startTime: reservation.start_time,
                endTime: reservation.end_time,
                status: reservation.status,
                type: reservation.type as UpcomingReservation['type'],
              };
            })
          );

          callback(reservations);
        } catch (err) {
          console.error('[subscribeToUpcomingReservations] Mapping error:', err);
          if (errorCallback) {
            errorCallback(err instanceof Error ? err : new Error('Failed to map reservations'));
          }
        }
      },
      (error) => {
        console.error('[subscribeToUpcomingReservations] Error:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Failed to fetch reservations'));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToUpcomingReservations] Setup error:', error);
    throw error;
  }
}

// ==========================================
// COURT RESERVATIONS BY DATE
// ==========================================

/**
 * Get reservations for a specific court on a specific date
 *
 * Query: Get reservations for court_id on date, filtered by confirmed/pending status
 * Index used: reservations:court_id+start_time+status
 *
 * @param courtId - Court ID to fetch reservations for
 * @param date - Date to fetch reservations for
 * @returns Promise resolving to ServiceResult with reservations
 */
export async function getCourtReservationsByDate(
  courtId: string,
  date: Date
): Promise<ServiceResult<Reservation[]>> {
  try {
    // Calculate start and end of day in Martinique timezone
    const startOfDay = Timestamp.fromDate(dayjs(date).tz(TIMEZONE).startOf('day').toDate());
    const endOfDay = Timestamp.fromDate(dayjs(date).tz(TIMEZONE).endOf('day').toDate());

    // Query: Get court reservations for date range with status filter
    // Uses index: reservations:court_id+start_time+status
    const constraints: QueryConstraint[] = [
      where('court_id', '==', courtId),
      where('start_time', '>=', startOfDay),
      where('start_time', '<=', endOfDay),
      where('status', 'in', ['confirmed', 'pending', 'pending_payment']),
      orderBy('start_time', 'asc'),
    ];

    const q = query(collection(db, 'reservations'), ...constraints);
    const snapshot = await getDocs(q);

    const reservations = snapshot.docs.map((docSnap) =>
      mapToReservation(docSnap.id, docSnap.data() as Record<string, unknown>)
    );

    return {
      success: true,
      data: reservations,
    };
  } catch (error) {
    console.error('[getCourtReservationsByDate] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch court reservations',
    };
  }
}

/**
 * Get all court reservations for a date range (for grid display)
 *
 * @param courtIds - Array of court IDs to fetch reservations for
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns Promise resolving to ServiceResult with reservations grouped by court
 */
export async function getCourtReservationsByDateRange(
  courtIds: string[],
  startDate: Date,
  endDate: Date
): Promise<ServiceResult<Map<string, Reservation[]>>> {
  try {
    const startOfDay = Timestamp.fromDate(dayjs(startDate).tz(TIMEZONE).startOf('day').toDate());
    const endOfDay = Timestamp.fromDate(dayjs(endDate).tz(TIMEZONE).endOf('day').toDate());

    // Fetch reservations for all courts in parallel
    const promises = courtIds.map(async (courtId) => {
      const constraints: QueryConstraint[] = [
        where('court_id', '==', courtId),
        where('start_time', '>=', startOfDay),
        where('start_time', '<=', endOfDay),
        where('status', 'in', ['confirmed', 'pending', 'pending_payment']),
        orderBy('start_time', 'asc'),
      ];

      const q = query(collection(db, 'reservations'), ...constraints);
      const snapshot = await getDocs(q);

      const reservations = snapshot.docs.map((docSnap) =>
        mapToReservation(docSnap.id, docSnap.data() as Record<string, unknown>)
      );

      return { courtId, reservations };
    });

    const results = await Promise.all(promises);
    const reservationsMap = new Map<string, Reservation[]>();

    results.forEach(({ courtId, reservations }) => {
      reservationsMap.set(courtId, reservations);
    });

    return {
      success: true,
      data: reservationsMap,
    };
  } catch (error) {
    console.error('[getCourtReservationsByDateRange] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch court reservations',
    };
  }
}

// ==========================================
// MAINTENANCE NOTE
// ==========================================

/**
 * Get the active maintenance note (most recent)
 *
 * Query: Get active maintenance notes sorted by created_at descending
 * Index used: maintenance_notes:is_active+created_at
 *
 * @returns Promise resolving to ServiceResult with active maintenance note
 */
export async function getActiveMaintenanceNote(): Promise<ServiceResult<MaintenanceNote | null>> {
  try {
    // Query: Get active maintenance note (most recent first)
    // Uses index: maintenance_notes:is_active+created_at
    const q = query(
      collection(db, 'maintenance_notes'),
      where('is_active', '==', true),
      orderBy('created_at', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: true,
        data: null,
      };
    }

    const docSnap = snapshot.docs[0];
    const note = mapToMaintenanceNote(docSnap.id, docSnap.data() as Record<string, unknown>);

    return {
      success: true,
      data: note,
    };
  } catch (error) {
    console.error('[getActiveMaintenanceNote] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch maintenance note',
    };
  }
}

/**
 * Subscribe to active maintenance note with real-time updates
 *
 * @param callback - Callback function invoked on snapshot updates
 * @param errorCallback - Optional error callback
 * @returns Unsubscribe function to clean up the listener
 */
export function subscribeToActiveMaintenanceNote(
  callback: (note: MaintenanceNote | null) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, 'maintenance_notes'),
      where('is_active', '==', true),
      orderBy('created_at', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(null);
          return;
        }

        const docSnap = snapshot.docs[0];
        const note = mapToMaintenanceNote(docSnap.id, docSnap.data() as Record<string, unknown>);
        callback(note);
      },
      (error) => {
        console.error('[subscribeToActiveMaintenanceNote] Error:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Failed to fetch maintenance note'));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToActiveMaintenanceNote] Setup error:', error);
    throw error;
  }
}

// ==========================================
// DASHBOARD STATS
// ==========================================

/**
 * Get dashboard statistics for a user
 *
 * Calculates:
 * - activeBookings: Count of user's confirmed/pending reservations
 * - maintenanceCount: Count of active maintenance notes
 * - availableSlots: Count of available moniteur slots
 *
 * @param userId - User ID to calculate stats for
 * @returns Promise resolving to ServiceResult with dashboard stats
 */
export async function getDashboardStats(userId: string): Promise<ServiceResult<DashboardStats>> {
  try {
    const now = Timestamp.now();

    // Query 1: Count user's active bookings (confirmed + pending)
    // Uses index: reservations:user_id+start_time
    const activeBookingsQuery = query(
      collection(db, 'reservations'),
      where('user_id', '==', userId),
      where('start_time', '>=', now),
      where('status', 'in', ['confirmed', 'pending', 'pending_payment'])
    );

    // Query 2: Count active maintenance notes
    // Uses index: maintenance_notes:is_active+created_at
    const maintenanceQuery = query(
      collection(db, 'maintenance_notes'),
      where('is_active', '==', true)
    );

    // Query 3: Count available moniteur slots (next 7 days)
    const today = dayjs().tz(TIMEZONE).format('YYYY-MM-DD');
    const nextWeek = dayjs().tz(TIMEZONE).add(7, 'day').format('YYYY-MM-DD');

    const availableSlotsQuery = query(
      collection(db, 'slots_moniteurs'),
      where('date', '>=', today),
      where('date', '<=', nextWeek),
      where('status', '==', 'available')
    );

    // Execute all queries in parallel
    const [activeBookingsSnapshot, maintenanceSnapshot, availableSlotsSnapshot] = await Promise.all([
      getDocs(activeBookingsQuery),
      getDocs(maintenanceQuery),
      getDocs(availableSlotsQuery),
    ]);

    const stats: DashboardStats = {
      activeBookings: activeBookingsSnapshot.size,
      maintenanceCount: maintenanceSnapshot.size,
      availableSlots: availableSlotsSnapshot.size,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('[getDashboardStats] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
    };
  }
}

// ==========================================
// COURT GRID GENERATION
// ==========================================

/**
 * Generate court grid cells for a specific date
 *
 * Creates a grid of cells representing court availability for each hour
 * Default: 6 courts × 12 hours (7:00 - 19:00) = 72 cells
 *
 * @param courts - Array of courts to include in grid
 * @param date - Date to generate grid for
 * @param reservations - Map of courtId → reservations for that date
 * @param startHour - Starting hour (default: 7)
 * @param endHour - Ending hour (default: 19)
 * @returns Array of court grid cells organized by row
 */
export function generateCourtGrid(
  courts: Court[],
  date: Date,
  reservations: Map<string, Reservation[]>,
  startHour: number = 7,
  endHour: number = 19
): CourtGridCell[][] {
  const grid: CourtGridCell[][] = [];
  const totalHours = endHour - startHour;

  // Sort courts by number
  const sortedCourts = [...courts].sort((a, b) => a.number - b.number);

  // Generate grid row by row (each row = 1 hour)
  for (let hour = startHour; hour < endHour; hour++) {
    const row: CourtGridCell[] = [];

    for (const court of sortedCourts) {
      const courtReservations = reservations.get(court.id) || [];

      // Find reservation that overlaps with this hour
      const hourStart = dayjs(date).tz(TIMEZONE).hour(hour).minute(0).second(0).toDate();
      const hourEnd = dayjs(date).tz(TIMEZONE).hour(hour + 1).minute(0).second(0).toDate();

      const overlappingReservation = courtReservations.find((res) => {
        const resStart = res.start_time.toDate();
        const resEnd = res.end_time.toDate();

        return (
          (resStart <= hourStart && resEnd > hourStart) ||
          (resStart >= hourStart && resStart < hourEnd)
        );
      });

      const cell: CourtGridCell = {
        id: `${court.id}-${hour}`,
        courtId: court.id,
        courtNumber: court.number,
        courtName: court.name,
        courtType: court.type,
        date,
        hour,
        state: getCellStateFromReservation(overlappingReservation || null),
        reservationId: overlappingReservation?.id,
      };

      row.push(cell);
    }

    grid.push(row);
  }

  return grid;
}

// ==========================================
// LOCATION DATA
// ==========================================

/**
 * Get club location data (static configuration)
 *
 * @returns LocationData for the tennis club
 */
export function getClubLocation() {
  return {
    address: 'Rue du Tennis',
    city: 'Le François',
    postalCode: '97240',
    phone: '+596 696 12 34 56',
    email: 'contact@tennis-francois.mq',
    mapUrl: 'https://maps.google.com/?q=Le+François+97240',
  };
}

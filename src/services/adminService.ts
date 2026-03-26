/**
 * Admin Service
 *
 * Service layer for Admin Dashboard operations including:
 * - Today's active bookings stats
 * - Maintenance count (courts in maintenance)
 * - Court utilization data for charts
 * - User directory with search and filters
 * - Real-time subscription to today's reservations
 * - Court blocking for maintenance
 *
 * All operations use try/catch for error handling and the Firebase singleton pattern.
 * Timezone: America/Martinique (AST, UTC-4)
 *
 * Admin Access: All functions require admin role (enforced by Firestore security rules)
 *
 * @module @services/adminService
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
  updateDoc,
  runTransaction,
  Timestamp,
  type Unsubscribe,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore';
import type { Court, CourtStatus } from '../types/court.types';
import type { Reservation, ReservationStatus, ReservationType } from '../types/reservation.types';
import type { User, UserRole, UserStatus } from '../types/user.types';
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
 * Today's active bookings statistics
 */
export interface TodaysActiveBookings {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  maintenanceBlocks: number;
  utilizationRate: number; // Percentage of slots booked
}

/**
 * Court utilization data point for charts
 */
export interface CourtUtilizationDataPoint {
  courtId: string;
  courtName: string;
  courtNumber: number;
  courtType: Court['type'];
  totalSlots: number;
  bookedSlots: number;
  maintenanceSlots: number;
  utilizationRate: number;
  reservations: Array<{
    startTime: Timestamp;
    endTime: Timestamp;
    type: ReservationType;
    status: ReservationStatus;
    userName?: string;
  }>;
}

/**
 * User directory entry
 */
export interface UserDirectoryEntry {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
}

/**
 * User search filters
 */
export interface UserSearchFilters {
  role?: UserRole;
  status?: UserStatus;
  searchQuery?: string;
}

/**
 * Court deployment cell for admin grid
 */
export interface AdminCourtCell {
  courtId: string;
  courtNumber: number;
  courtName: string;
  courtType: Court['type'];
  status: CourtStatus;
  isActive: boolean;
  currentReservation?: {
    reservationId: string;
    type: ReservationType;
    status: ReservationStatus;
    userName: string;
    startTime: Timestamp;
    endTime: Timestamp;
  };
  nextReservation?: {
    reservationId: string;
    type: ReservationType;
    startTime: Timestamp;
    endTime: Timestamp;
  };
}

/**
 * Maintenance block input
 */
export interface MaintenanceBlockInput {
  courtId: string;
  startTime: Date;
  endTime: Date;
  title: string;
  description?: string;
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
    type: data.type as Court['type'],
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
    updated_at: data.updatedAt as Timestamp | undefined,
  };
}

/**
 * Map Firestore document data to User type safely
 */
function mapToUser(docId: string, data: Record<string, unknown>): User {
  return {
    uid: docId,
    name: data.name as string,
    email: data.email as string,
    role: data.role as UserRole,
    phone: data.phone as string | undefined,
    status: data.status as UserStatus,
    avatar: data.avatar as string | undefined,
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
    lastLoginAt: data.lastLoginAt as Timestamp | undefined,
  };
}

/**
 * Get start and end of day timestamps in Martinique timezone
 */
function getDayRange(date: Date): { start: Timestamp; end: Timestamp } {
  const start = Timestamp.fromDate(dayjs(date).tz(TIMEZONE).startOf('day').toDate());
  const end = Timestamp.fromDate(dayjs(date).tz(TIMEZONE).endOf('day').toDate());
  return { start, end };
}

/**
 * Fetch user name for a reservation
 */
async function getUserName(userId: string): Promise<string> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? (userDoc.data().name as string) : 'Unknown User';
  } catch (error) {
    console.error('[getUserName] Error:', error);
    return 'Unknown User';
  }
}

// ==========================================
// TODAY'S ACTIVE BOOKINGS
// ==========================================

/**
 * Get today's active bookings statistics
 *
 * Query: Get all reservations for today filtered by status
 * Index used: reservations:start_time+status+type
 *
 * Calculates:
 * - totalBookings: All reservations for today
 * - confirmedBookings: Reservations with status 'confirmed'
 * - pendingBookings: Reservations with status 'pending' or 'pending_payment'
 * - maintenanceBlocks: Reservations with type 'maintenance'
 * - utilizationRate: Percentage of hourly slots booked
 *
 * @returns Promise resolving to ServiceResult with today's active bookings stats
 */
export async function getTodaysActiveBookings(): Promise<ServiceResult<TodaysActiveBookings>> {
  try {
    const today = new Date();
    const { start, end } = getDayRange(today);

    // Query: Get all reservations for today
    // Uses index: reservations:start_time+status+type
    const constraints: QueryConstraint[] = [
      where('start_time', '>=', start),
      where('start_time', '<=', end),
      where('status', 'in', ['confirmed', 'pending', 'pending_payment', 'maintenance']),
      orderBy('start_time', 'asc'),
    ];

    const q = query(collection(db, 'reservations'), ...constraints);
    const snapshot = await getDocs(q);

    let totalBookings = 0;
    let confirmedBookings = 0;
    let pendingBookings = 0;
    let maintenanceBlocks = 0;

    snapshot.docs.forEach((docSnap) => {
      const reservation = mapToReservation(docSnap.id, docSnap.data() as Record<string, unknown>);
      totalBookings++;

      if (reservation.type === 'maintenance') {
        maintenanceBlocks++;
      } else if (reservation.status === 'confirmed') {
        confirmedBookings++;
      } else if (reservation.status === 'pending' || reservation.status === 'pending_payment') {
        pendingBookings++;
      }
    });

    // Calculate utilization rate (booked slots / total available slots)
    // Assuming 12 hours (7:00-19:00) × 6 courts = 72 slots per day
    const totalSlots = 12 * 6; // 72 slots
    const bookedSlots = confirmedBookings + pendingBookings;
    const utilizationRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    const stats: TodaysActiveBookings = {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      maintenanceBlocks,
      utilizationRate,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('[getTodaysActiveBookings] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch today\'s active bookings',
    };
  }
}

// ==========================================
// MAINTENANCE COUNT
// ==========================================

/**
 * Get count of courts currently in maintenance
 *
 * Query: Get courts with status 'maintenance'
 * Index used: courts:status+type (existing index)
 *
 * @returns Promise resolving to ServiceResult with maintenance count and court IDs
 */
export async function getMaintenanceCount(): Promise<ServiceResult<{
  count: number;
  courtIds: string[];
  courtNames: string[];
}>> {
  try {
    // Query: Get courts in maintenance status
    const q = query(
      collection(db, 'courts'),
      where('status', '==', 'maintenance')
    );

    const snapshot = await getDocs(q);

    const courtIds: string[] = [];
    const courtNames: string[] = [];

    snapshot.docs.forEach((docSnap) => {
      const court = mapToCourt(docSnap.id, docSnap.data() as Record<string, unknown>);
      courtIds.push(court.id);
      courtNames.push(court.name);
    });

    return {
      success: true,
      data: {
        count: snapshot.size,
        courtIds,
        courtNames,
      },
    };
  } catch (error) {
    console.error('[getMaintenanceCount] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch maintenance count',
    };
  }
}

// ==========================================
// COURT UTILIZATION DATA
// ==========================================

/**
 * Get court utilization data for charts
 *
 * Query: Get reservations for each court on a specific date
 * Index used: reservations:court_id+start_time+type
 *
 * Returns data structured for chart libraries:
 * - One data point per court
 * - Utilization rate percentage
 * - List of reservations with user names
 *
 * @param date - Date to fetch utilization data for
 * @returns Promise resolving to ServiceResult with court utilization data
 */
export async function getCourtUtilizationData(
  date: Date
): Promise<ServiceResult<CourtUtilizationDataPoint[]>> {
  try {
    const { start, end } = getDayRange(date);

    // First, get all courts
    const courtsQuery = query(collection(db, 'courts'));
    const courtsSnapshot = await getDocs(courtsQuery);
    const courts = courtsSnapshot.docs.map((docSnap) =>
      mapToCourt(docSnap.id, docSnap.data() as Record<string, unknown>)
    );

    // Then, get all reservations for the date
    const reservationsQuery = query(
      collection(db, 'reservations'),
      where('start_time', '>=', start),
      where('start_time', '<=', end),
      where('status', 'in', ['confirmed', 'pending', 'pending_payment', 'maintenance']),
      orderBy('start_time', 'asc')
    );

    const reservationsSnapshot = await getDocs(reservationsQuery);
    const reservations = reservationsSnapshot.docs.map((docSnap) =>
      mapToReservation(docSnap.id, docSnap.data() as Record<string, unknown>)
    );

    // Build utilization data per court
    const utilizationData: CourtUtilizationDataPoint[] = await Promise.all(
      courts.map(async (court) => {
        const courtReservations = reservations.filter((res) => res.court_id === court.id);

        let bookedSlots = 0;
        let maintenanceSlots = 0;

        // Fetch user names for each reservation
        const reservationsWithUsers = await Promise.all(
          courtReservations.map(async (res) => {
            if (res.type === 'maintenance') {
              maintenanceSlots++;
            } else if (res.status === 'confirmed' || res.status === 'pending' || res.status === 'pending_payment') {
              bookedSlots++;
            }

            const userName = res.type !== 'maintenance' ? await getUserName(res.user_id) : undefined;

            return {
              startTime: res.start_time,
              endTime: res.end_time,
              type: res.type,
              status: res.status,
              userName,
            };
          })
        );

        // Assuming 12 hours (7:00-19:00) = 12 slots per court
        const totalSlots = 12;
        const utilizationRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

        return {
          courtId: court.id,
          courtName: court.name,
          courtNumber: court.number,
          courtType: court.type,
          totalSlots,
          bookedSlots,
          maintenanceSlots,
          utilizationRate,
          reservations: reservationsWithUsers,
        };
      })
    );

    // Sort by court number
    utilizationData.sort((a, b) => a.courtNumber - b.courtNumber);

    return {
      success: true,
      data: utilizationData,
    };
  } catch (error) {
    console.error('[getCourtUtilizationData] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch court utilization data',
    };
  }
}

// ==========================================
// ALL COURTS FOR DEPLOYMENT
// ==========================================

/**
 * Get all courts for deployment grid display
 *
 * Query: Get all courts sorted by number
 * Index used: courts:is_active+number (existing index)
 *
 * Includes current and next reservation for each court
 *
 * @param date - Date to fetch court data for
 * @returns Promise resolving to ServiceResult with admin court cells
 */
export async function getAllCourtsForDeployment(
  date: Date
): Promise<ServiceResult<AdminCourtCell[]>> {
  try {
    const { start, end } = getDayRange(date);
    const now = Timestamp.now();

    // Get all courts
    const courtsQuery = query(
      collection(db, 'courts'),
      orderBy('number', 'asc')
    );

    const courtsSnapshot = await getDocs(courtsQuery);
    const courts = courtsSnapshot.docs.map((docSnap) =>
      mapToCourt(docSnap.id, docSnap.data() as Record<string, unknown>)
    );

    // Get today's reservations
    const reservationsQuery = query(
      collection(db, 'reservations'),
      where('start_time', '>=', start),
      where('start_time', '<=', end),
      where('status', 'in', ['confirmed', 'pending', 'pending_payment']),
      orderBy('start_time', 'asc')
    );

    const reservationsSnapshot = await getDocs(reservationsQuery);
    const reservations = reservationsSnapshot.docs.map((docSnap) =>
      mapToReservation(docSnap.id, docSnap.data() as Record<string, unknown>)
    );

    // Build admin court cells
    const courtCells: AdminCourtCell[] = await Promise.all(
      courts.map(async (court) => {
        const courtReservations = reservations
          .filter((res) => res.court_id === court.id)
          .sort((a, b) => a.start_time.seconds - b.start_time.seconds);

        // Find current reservation (overlapping with now)
        const currentReservation = courtReservations.find(
          (res) => res.start_time <= now && res.end_time >= now
        );

        // Find next reservation (after now)
        const nextReservation = courtReservations.find(
          (res) => res.start_time > now
        );

        const cell: AdminCourtCell = {
          courtId: court.id,
          courtNumber: court.number,
          courtName: court.name,
          courtType: court.type,
          status: court.status,
          isActive: court.is_active,
        };

        if (currentReservation) {
          const userName = await getUserName(currentReservation.user_id);
          cell.currentReservation = {
            reservationId: currentReservation.id!,
            type: currentReservation.type,
            status: currentReservation.status,
            userName,
            startTime: currentReservation.start_time,
            endTime: currentReservation.end_time,
          };
        }

        if (nextReservation) {
          cell.nextReservation = {
            reservationId: nextReservation.id!,
            type: nextReservation.type,
            startTime: nextReservation.start_time,
            endTime: nextReservation.end_time,
          };
        }

        return cell;
      })
    );

    return {
      success: true,
      data: courtCells,
    };
  } catch (error) {
    console.error('[getAllCourtsForDeployment] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch courts for deployment',
    };
  }
}

// ==========================================
// USER DIRECTORY SEARCH
// ==========================================

/**
 * Search users with filters
 *
 * Query: Get users filtered by role and/or status, with optional name/email search
 * Index used: users:role+name OR users:status+email
 *
 * @param searchQuery - Optional search query (matches name or email)
 * @param filters - Optional filters (role, status)
 * @returns Promise resolving to ServiceResult with user directory entries
 */
export async function searchUsers(
  searchQuery?: string,
  filters?: UserSearchFilters
): Promise<ServiceResult<UserDirectoryEntry[]>> {
  try {
    let q;

    // Build query based on filters
    if (filters?.role) {
      // Use index: users:role+name
      const constraints: QueryConstraint[] = [
        where('role', '==', filters.role),
        orderBy('name', 'asc'),
      ];

      q = query(collection(db, 'users'), ...constraints);
    } else if (filters?.status) {
      // Use index: users:status+email
      const constraints: QueryConstraint[] = [
        where('status', '==', filters.status),
        orderBy('email', 'asc'),
      ];

      q = query(collection(db, 'users'), ...constraints);
    } else {
      // No filters - get all users
      q = query(collection(db, 'users'));
    }

    const snapshot = await getDocs(q);

    let users = snapshot.docs.map((docSnap) =>
      mapToUser(docSnap.id, docSnap.data() as Record<string, unknown>)
    );

    // Apply search query filter (client-side for name/email match)
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(queryLower) ||
          user.email.toLowerCase().includes(queryLower)
      );
    }

    // Map to directory entries
    const directoryEntries: UserDirectoryEntry[] = users.map((user) => ({
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    }));

    return {
      success: true,
      data: directoryEntries,
    };
  } catch (error) {
    console.error('[searchUsers] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search users',
    };
  }
}

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to today's reservations with real-time updates
 *
 * Query: Get all reservations for today
 * Index used: reservations:start_time+status+type
 *
 * @param callback - Callback function invoked on snapshot updates
 * @param errorCallback - Optional error callback
 * @returns Unsubscribe function to clean up the listener
 */
export function subscribeToTodaysReservations(
  callback: (reservations: Reservation[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  try {
    const today = new Date();
    const { start, end } = getDayRange(today);

    const q = query(
      collection(db, 'reservations'),
      where('start_time', '>=', start),
      where('start_time', '<=', end),
      where('status', 'in', ['confirmed', 'pending', 'pending_payment', 'maintenance']),
      orderBy('start_time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reservations = snapshot.docs.map((docSnap) =>
          mapToReservation(docSnap.id, docSnap.data() as Record<string, unknown>)
        );
        callback(reservations);
      },
      (error) => {
        console.error('[subscribeToTodaysReservations] Error:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Failed to fetch reservations'));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToTodaysReservations] Setup error:', error);
    throw error;
  }
}

/**
 * Subscribe to court utilization changes
 *
 * @param date - Date to subscribe to utilization data for
 * @param callback - Callback function invoked on snapshot updates
 * @param errorCallback - Optional error callback
 * @returns Unsubscribe function to clean up the listener
 */
export function subscribeToCourtUtilization(
  date: Date,
  callback: (utilizationData: CourtUtilizationDataPoint[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  try {
    const { start, end } = getDayRange(date);

    const q = query(
      collection(db, 'reservations'),
      where('start_time', '>=', start),
      where('start_time', '<=', end),
      where('status', 'in', ['confirmed', 'pending', 'pending_payment', 'maintenance'])
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          // Get all courts
          const courtsSnapshot = await getDocs(query(collection(db, 'courts')));
          const courts = courtsSnapshot.docs.map((docSnap) =>
            mapToCourt(docSnap.id, docSnap.data() as Record<string, unknown>)
          );

          // Map reservations
          const reservations = snapshot.docs.map((docSnap) =>
            mapToReservation(docSnap.id, docSnap.data() as Record<string, unknown>)
          );

          // Build utilization data
          const utilizationData = await Promise.all(
            courts.map(async (court) => {
              const courtReservations = reservations.filter((res) => res.court_id === court.id);

              let bookedSlots = 0;
              let maintenanceSlots = 0;

              const reservationsWithUsers = await Promise.all(
                courtReservations.map(async (res) => {
                  if (res.type === 'maintenance') {
                    maintenanceSlots++;
                  } else if (res.status === 'confirmed' || res.status === 'pending' || res.status === 'pending_payment') {
                    bookedSlots++;
                  }

                  const userName = res.type !== 'maintenance' ? await getUserName(res.user_id) : undefined;

                  return {
                    startTime: res.start_time,
                    endTime: res.end_time,
                    type: res.type,
                    status: res.status,
                    userName,
                  };
                })
              );

              const totalSlots = 12;
              const utilizationRate = Math.round((bookedSlots / totalSlots) * 100);

              return {
                courtId: court.id,
                courtName: court.name,
                courtNumber: court.number,
                courtType: court.type,
                totalSlots,
                bookedSlots,
                maintenanceSlots,
                utilizationRate,
                reservations: reservationsWithUsers,
              };
            })
          );

          utilizationData.sort((a, b) => a.courtNumber - b.courtNumber);
          callback(utilizationData);
        } catch (err) {
          console.error('[subscribeToCourtUtilization] Mapping error:', err);
          if (errorCallback) {
            errorCallback(err instanceof Error ? err : new Error('Failed to map utilization data'));
          }
        }
      },
      (error) => {
        console.error('[subscribeToCourtUtilization] Error:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Failed to fetch utilization data'));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToCourtUtilization] Setup error:', error);
    throw error;
  }
}

// ==========================================
// COURT MAINTENANCE BLOCKING
// ==========================================

/**
 * Block a court for maintenance
 *
 * Uses Firestore transaction for atomic operation:
 * 1. Create maintenance reservation
 * 2. Update court status to 'maintenance'
 *
 * @param blockInput - Maintenance block input data
 * @returns Promise resolving to ServiceResult with reservation ID
 */
export async function blockCourtForMaintenance(
  blockInput: MaintenanceBlockInput
): Promise<ServiceResult<{ reservationId: string }>> {
  try {
    const courtRef = doc(db, 'courts', blockInput.courtId);
    const reservationRef = doc(collection(db, 'reservations'));

    // Get admin user ID (current user)
    // In production, this would come from auth context
    const adminUserId = 'admin_001'; // Placeholder - replace with actual auth

    await runTransaction(db, async (transaction) => {
      // Verify court exists
      const courtDoc = await transaction.get(courtRef);
      if (!courtDoc.exists()) {
        throw new Error('Court not found');
      }

      // Create maintenance reservation
      transaction.set(reservationRef, {
        court_id: blockInput.courtId,
        user_id: adminUserId,
        start_time: Timestamp.fromDate(blockInput.startTime),
        end_time: Timestamp.fromDate(blockInput.endTime),
        type: 'maintenance',
        status: 'confirmed',
        title: blockInput.title,
        description: blockInput.description || 'Court maintenance',
        is_paid: false,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      // Update court status to maintenance
      transaction.update(courtRef, {
        status: 'maintenance',
        is_active: false,
        updatedAt: Timestamp.now(),
      });
    });

    return {
      success: true,
      data: { reservationId: reservationRef.id },
    };
  } catch (error) {
    console.error('[blockCourtForMaintenance] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to block court for maintenance',
    };
  }
}

/**
 * Unblock a court (remove maintenance status)
 *
 * Uses Firestore transaction for atomic operation:
 * 1. Update court status to 'active'
 *
 * @param courtId - Court ID to unblock
 * @returns Promise resolving to ServiceResult
 */
export async function unblockCourt(courtId: string): Promise<ServiceResult<void>> {
  try {
    const courtRef = doc(db, 'courts', courtId);

    await updateDoc(courtRef, {
      status: 'active',
      is_active: true,
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[unblockCourt] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unblock court',
    };
  }
}

// ==========================================
// STATS SUMMARY
// ==========================================

/**
 * Get complete admin dashboard stats summary
 *
 * Combines multiple stats queries into a single call:
 * - Today's active bookings
 * - Maintenance count
 * - Total users
 * - Total courts
 *
 * @returns Promise resolving to ServiceResult with complete stats summary
 */
export async function getAdminDashboardStats(): Promise<ServiceResult<{
  todaysBookings: TodaysActiveBookings;
  maintenanceCount: number;
  totalUsers: number;
  totalCourts: number;
  activeCourts: number;
}>> {
  try {
    // Execute all queries in parallel
    const [bookingsResult, maintenanceResult, usersSnapshot, courtsSnapshot] = await Promise.all([
      getTodaysActiveBookings(),
      getMaintenanceCount(),
      getDocs(query(collection(db, 'users'))),
      getDocs(query(collection(db, 'courts'))),
    ]);

    const totalCourts = courtsSnapshot.size;
    const activeCourts = courtsSnapshot.docs.filter(
      (docSnap) => (docSnap.data().is_active as boolean) === true
    ).length;

    const totalUsers = usersSnapshot.size;

    return {
      success: true,
      data: {
        todaysBookings: bookingsResult.success ? bookingsResult.data! : {
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          maintenanceBlocks: 0,
          utilizationRate: 0,
        },
        maintenanceCount: maintenanceResult.success ? maintenanceResult.data!.count : 0,
        totalUsers,
        totalCourts,
        activeCourts,
      },
    };
  } catch (error) {
    console.error('[getAdminDashboardStats] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch admin dashboard stats',
    };
  }
}

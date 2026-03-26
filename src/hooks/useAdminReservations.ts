/**
 * useAdminReservations Hook
 *
 * Admin hook for reservations management with real-time updates.
 * Handles CRUD operations, filtering, and pagination.
 *
 * Features:
 * - Real-time reservations subscription with onSnapshot
 * - Filter by date range, court, status, type, search query
 * - CRUD operations (update, cancel, complete)
 * - Types de retour explicites (ServiceResult)
 * - try/catch sur toutes les opérations Firestore
 *
 * @module @hooks/useAdminReservations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { getDbInstance } from '../config/firebase.config';
import type { Reservation, ReservationStatus, ReservationType } from '../types/reservation.types';
import type { User } from '../types/user.types';
import type { Court } from '../types/court.types';
import type { ServiceResult } from '../types/service.types';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * Filter state interface
 */
export interface ReservationFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  courtId: string | 'all';
  status: ReservationStatus | 'all';
  type: ReservationType | 'all';
  searchQuery: string;
}

/**
 * Edit reservation input
 */
export interface EditReservationInput {
  court_id: string;
  start_time: Date;
  end_time: Date;
  type: ReservationType;
  status: ReservationStatus;
  participants?: number;
  description?: string;
  moniteur_id?: string;
}

/**
 * Cancel reservation input
 */
export interface CancelReservationInput {
  reason?: string;
  sendNotification: boolean;
}

/**
 * Hook return type
 */
export interface UseAdminReservationsReturn {
  // Data
  reservations: Reservation[];
  filteredReservations: Reservation[];
  users: Map<string, User>;
  courts: Map<string, Court>;

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;

  // Errors
  error: Error | null;

  // Filters
  filters: ReservationFilters;
  setFilters: (filters: ReservationFilters) => void;

  // Operations
  updateReservation: (id: string, data: EditReservationInput) => Promise<ServiceResult<void>>;
  cancelReservation: (id: string, input: CancelReservationInput) => Promise<ServiceResult<void>>;
  completeReservation: (id: string) => Promise<ServiceResult<void>>;

  // UI State
  isEditModalOpen: boolean;
  isCancelDialogOpen: boolean;
  selectedReservation: Reservation | null;
  openEditModal: (reservation: Reservation) => void;
  closeEditModal: () => void;
  openCancelDialog: (reservation: Reservation) => void;
  closeCancelDialog: () => void;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Format timestamp to Date
 */
function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

/**
 * Check if reservation matches filters
 */
function matchesFilters(
  reservation: Reservation,
  filters: ReservationFilters,
  users: Map<string, User>,
  courts: Map<string, Court>
): boolean {
  // Filter by court
  if (filters.courtId !== 'all' && reservation.court_id !== filters.courtId) {
    return false;
  }

  // Filter by status
  if (filters.status !== 'all' && reservation.status !== filters.status) {
    return false;
  }

  // Filter by type
  if (filters.type !== 'all' && reservation.type !== filters.type) {
    return false;
  }

  // Filter by date range
  if (filters.dateRange.start || filters.dateRange.end) {
    const reservationDate = timestampToDate(reservation.start_time);
    if (filters.dateRange.start && reservationDate < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && reservationDate > filters.dateRange.end) {
      return false;
    }
  }

  // Filter by search query (user name or moniteur name)
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    const userName = users.get(reservation.user_id)?.name.toLowerCase() || '';
    const moniteurId = reservation.moniteur_id;
    const moniteurName = moniteurId ? (users.get(moniteurId)?.name.toLowerCase() || '') : '';

    if (!userName.includes(query) && !moniteurName.includes(query)) {
      return false;
    }
  }

  return true;
}

// ==========================================
// MAIN HOOK
// ==========================================

export function useAdminReservations(): UseAdminReservationsReturn {
  // State
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [courts, setCourts] = useState<Map<string, Court>>(new Map());

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [filters, setFiltersState] = useState<ReservationFilters>({
    dateRange: {
      start: null,
      end: null,
    },
    courtId: 'all',
    status: 'all',
    type: 'all',
    searchQuery: '',
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  /**
   * Subscribe to reservations with onSnapshot
   */
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(getDbInstance(), 'reservations'),
      orderBy('start_time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          const reservation: Reservation = {
            id: doc.id,
            court_id: docData.court_id,
            user_id: docData.user_id,
            moniteur_id: docData.moniteur_id,
            start_time: docData.start_time,
            end_time: docData.end_time,
            type: docData.type,
            status: docData.status,
            title: docData.title,
            description: docData.description,
            participants: docData.participants,
            is_paid: docData.is_paid,
            created_at: docData.created_at,
            updated_at: docData.updated_at,
          };
          return reservation;
        });
        setReservations(data);
        setIsLoading(false);
      },
      (err) => {
        console.error('[useAdminReservations] Error:', err);
        setError(err instanceof Error ? err : new Error('Firestore error'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * Subscribe to users for lookup
   */
  useEffect(() => {
    const q = query(collection(getDbInstance(), 'users'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userMap = new Map<string, User>();
        snapshot.docs.forEach((doc) => {
          const userData = doc.data();
          const user: User = {
            uid: doc.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            phone: userData.phone,
            status: userData.status,
            avatar: userData.avatar,
            notifications: userData.notifications,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            lastLoginAt: userData.lastLoginAt,
          };
          userMap.set(doc.id, user);
        });
        setUsers(userMap);
      },
      (err) => {
        console.error('[useAdminReservations] Users subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * Subscribe to courts for lookup
   */
  useEffect(() => {
    const q = query(collection(getDbInstance(), 'courts'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const courtMap = new Map<string, Court>();
        snapshot.docs.forEach((doc) => {
          const courtData = doc.data();
          const court: Court = {
            id: doc.id,
            number: courtData.number,
            name: courtData.name,
            type: courtData.type,
            surface: courtData.surface,
            status: courtData.status,
            is_active: courtData.is_active,
            image: courtData.image,
            description: courtData.description,
            createdAt: courtData.createdAt,
            updatedAt: courtData.updatedAt,
          };
          courtMap.set(doc.id, court);
        });
        setCourts(courtMap);
      },
      (err) => {
        console.error('[useAdminReservations] Courts subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * Update filters
   */
  const setFilters = useCallback((newFilters: ReservationFilters) => {
    setFiltersState(newFilters);
  }, []);

  /**
   * Get filtered reservations
   */
  const filteredReservations = reservations.filter((reservation) =>
    matchesFilters(reservation, filters, users, courts)
  );

  /**
   * Update reservation
   */
  const updateReservation = useCallback(
    async (id: string, data: EditReservationInput): Promise<ServiceResult<void>> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const ref = doc(getDbInstance(), 'reservations', id);
        await updateDoc(ref, {
          court_id: data.court_id,
          start_time: Timestamp.fromDate(data.start_time),
          end_time: Timestamp.fromDate(data.end_time),
          type: data.type,
          status: data.status,
          participants: data.participants,
          description: data.description,
          moniteur_id: data.moniteur_id,
          updated_at: Timestamp.now(),
        });

        return { success: true };
      } catch (err) {
        console.error('[updateReservation] Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to update reservation';
        return { success: false, error: errorMessage };
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  /**
   * Cancel reservation
   */
  const cancelReservation = useCallback(
    async (id: string, input: CancelReservationInput): Promise<ServiceResult<void>> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const ref = doc(getDbInstance(), 'reservations', id);
        await updateDoc(ref, {
          status: 'cancelled',
          cancellation_reason: input.reason,
          cancellation_notification_sent: input.sendNotification,
          updated_at: Timestamp.now(),
        });

        // TODO: Send notification if sendNotification is true

        return { success: true };
      } catch (err) {
        console.error('[cancelReservation] Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to cancel reservation';
        return { success: false, error: errorMessage };
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  /**
   * Complete reservation
   */
  const completeReservation = useCallback(
    async (id: string): Promise<ServiceResult<void>> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const ref = doc(getDbInstance(), 'reservations', id);
        await updateDoc(ref, {
          status: 'completed',
          completed_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });

        return { success: true };
      } catch (err) {
        console.error('[completeReservation] Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to complete reservation';
        return { success: false, error: errorMessage };
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  /**
   * Open edit modal
   */
  const openEditModal = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsEditModalOpen(true);
  }, []);

  /**
   * Close edit modal
   */
  const closeEditModal = useCallback(() => {
    setSelectedReservation(null);
    setIsEditModalOpen(false);
  }, []);

  /**
   * Open cancel dialog
   */
  const openCancelDialog = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsCancelDialogOpen(true);
  }, []);

  /**
   * Close cancel dialog
   */
  const closeCancelDialog = useCallback(() => {
    setSelectedReservation(null);
    setIsCancelDialogOpen(false);
  }, []);

  return {
    // Data
    reservations,
    filteredReservations,
    users,
    courts,

    // Loading states
    isLoading,
    isSubmitting,

    // Errors
    error,

    // Filters
    filters,
    setFilters,

    // Operations
    updateReservation,
    cancelReservation,
    completeReservation,

    // UI State
    isEditModalOpen,
    isCancelDialogOpen,
    selectedReservation,
    openEditModal,
    closeEditModal,
    openCancelDialog,
    closeCancelDialog,
  };
}

export default useAdminReservations;

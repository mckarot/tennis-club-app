/**
 * MyReservationsPage Component
 *
 * Page for viewing and managing user's reservations at /client/reservations.
 * Integrates MyReservationsList, ReservationFilters, and StatsCards.
 *
 * @module @pages/client/MyReservationsPage
 */

import { useState, useCallback, useMemo } from 'react';
import { useRealtimeReservations } from '../../hooks/useRealtimeReservations';
import { useCourts } from '../../hooks/useCourts';
import { cancelReservation } from '../../services/reservationService';
import { MyReservationsList } from '../../components/reservations/MyReservationsList/MyReservationsList';
import { ReservationFilters } from '../../components/reservations/ReservationFilters/ReservationFilters';
import { StatsCards } from '../../components/reservations/StatsCards/StatsCards';
import { useNavigation } from '../../hooks/useNavigation';
import type { Reservation } from '../../types/reservation.types';
import type { Court } from '../../types/court.types';
import type { FilterState } from '../../components/reservations/ReservationFilters/ReservationFilters';

interface MyReservationsPageState {
  filters: FilterState;
  selectedReservation: Reservation | null;
  isRescheduleMode: boolean;
}

/**
 * Get user from session storage
 */
function getCurrentUserId(): string | null {
  try {
    const authData = sessionStorage.getItem('auth_data') || localStorage.getItem('auth_data');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.user?.id || null;
    }
  } catch (error) {
    console.error('[MyReservationsPage] Error reading auth data:', error);
  }
  return null;
}

export function MyReservationsPage(): JSX.Element {
  const userId = getCurrentUserId();
  const { reservations, isLoading, error } = useRealtimeReservations(
    userId ? { userId } : undefined
  );
  const { courts } = useCourts();
  const navigation = useNavigation();

  const [state, setState] = useState<MyReservationsPageState>({
    filters: {
      startDate: null,
      endDate: null,
      status: 'all',
      courtType: 'all',
      reservationType: 'all',
    },
    selectedReservation: null,
    isRescheduleMode: false,
  });

  const [isCancelling, setIsCancelling] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  /**
   * Filter reservations based on current filters
   *
   * Client-side filtering is used instead of Firestore queries because:
   * - Multiple filter criteria (date range, status, court type, reservation type)
   * - Would require complex composite indexes for all combinations
   * - Data set is typically small (< 100 reservations per user)
   * - Provides instant filter changes without additional database reads
   */
  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const { filters } = state;

      // Filter by date range
      if (filters.startDate) {
        const resDate = reservation.start_time.toDate();
        if (resDate < filters.startDate) return false;
      }

      if (filters.endDate) {
        const resDate = reservation.start_time.toDate();
        if (resDate > filters.endDate) return false;
      }

      // Filter by status
      if (filters.status !== 'all' && reservation.status !== filters.status) {
        return false;
      }

      // Filter by court type
      if (filters.courtType !== 'all') {
        const court = courts.find((c) => c.id === reservation.court_id);
        if (!court || court.type !== filters.courtType) return false;
      }

      // Filter by reservation type
      if (filters.reservationType !== 'all' && reservation.type !== filters.reservationType) {
        return false;
      }

      return true;
    });
  }, [reservations, state.filters, courts]);

  /**
   * Calculate statistics
   */
  const stats = useMemo(() => {
    const activeBookings = reservations.filter((r) => r.status === 'confirmed').length;
    const maintenanceCount = courts.filter((c) => c.status === 'maintenance' || !c.is_active).length;

    // Calculate available slots (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingReservations = reservations.filter((r) => {
      const resDate = r.start_time.toDate();
      return resDate >= now && resDate <= nextWeek && r.status === 'confirmed';
    });

    // Assume 12 slots per court per day × 7 days
    const totalSlots = courts.length * 12 * 7;
    const bookedSlots = upcomingReservations.length;
    const availableSlots = Math.max(0, totalSlots - bookedSlots);

    return {
      activeBookings,
      maintenanceCount,
      availableSlots,
    };
  }, [reservations, courts]);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((filters: FilterState) => {
    setState((prev) => ({
      ...prev,
      filters,
    }));
  }, []);

  /**
   * Handle reschedule request
   */
  const handleReschedule = useCallback((reservation: Reservation) => {
    setState((prev) => ({
      ...prev,
      selectedReservation: reservation,
      isRescheduleMode: true,
    }));
    // Navigate to booking page with pre-filled data
    navigation.navigate('/client/book', {
      rescheduleReservationId: reservation.id,
    });
  }, [navigation]);

  /**
   * Handle cancel request
   */
  const handleCancel = useCallback(async (reservation: Reservation) => {
    setIsCancelling(true);
    try {
      const result = await cancelReservation(reservation.id!);

      if (result.success) {
        setNotification({
          type: 'success',
          message: 'Réservation annulée avec succès',
        });
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Échec de l\'annulation',
        });
      }
    } catch (err) {
      console.error('[MyReservationsPage] Error cancelling reservation:', err);
      setNotification({
        type: 'error',
        message: 'Erreur lors de l\'annulation',
      });
    } finally {
      setIsCancelling(false);

      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  }, []);

  /**
   * Handle stats card click
   */
  const handleStatsCardClick = useCallback((type: 'active' | 'maintenance' | 'available') => {
    if (type === 'active') {
      setState((prev) => ({
        ...prev,
        filters: {
          ...prev.filters,
          status: 'confirmed',
        },
      }));
    } else if (type === 'maintenance') {
      // Could navigate to courts page with maintenance filter
      navigation.navigate('/courts');
    }
  }, [navigation]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Mes réservations</h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Gérez vos réservations de courts
          </p>
        </div>
        <button
          onClick={() => navigation.navigate('/client/book')}
          className="flex items-center gap-2 px-4 py-3 rounded-lg font-body text-body-sm font-medium bg-primary text-on-primary hover:bg-primary/90 transition-colors"
          aria-label="Create new reservation"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Réserver
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          role="alert"
          className={`flex items-center gap-3 p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-primary/10 text-primary'
              : 'bg-error-container text-on-error-container'
          }`}
        >
          <span className="material-symbols-outlined">
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-body text-body-sm">{notification.message}</span>
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards
        activeBookings={stats.activeBookings}
        maintenanceCount={stats.maintenanceCount}
        availableSlots={stats.availableSlots}
        isLoading={isLoading}
        onCardClick={handleStatsCardClick}
      />

      {/* Filters */}
      <ReservationFilters
        onFilterChange={handleFilterChange}
        initialFilters={state.filters}
        showDateRange={true}
        showStatus={true}
        showCourtType={true}
        showReservationType={false}
      />

      {/* Reservations List */}
      <div className="rounded-xl bg-surface-container-lowest p-6 border border-surface-container-highest">
        {error ? (
          <div
            role="alert"
            className="flex flex-col items-center justify-center p-12 text-center"
          >
            <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
            <h3 className="font-headline text-lg font-semibold text-on-surface">
              Erreur de chargement
            </h3>
            <p className="font-body text-body-sm text-on-surface-variant mt-2">
              {error.message}
            </p>
          </div>
        ) : (
          <MyReservationsList
            reservations={filteredReservations}
            courts={courts}
            isLoading={isLoading}
            onReschedule={handleReschedule}
            onCancel={handleCancel}
            emptyMessage={
              state.filters.status !== 'all' ||
              state.filters.startDate ||
              state.filters.endDate
                ? 'Aucune réservation pour ces filtres'
                : 'Aucune réservation'
            }
          />
        )}
      </div>
    </div>
  );
}

export default MyReservationsPage;

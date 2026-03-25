/**
 * BookingPage Component
 *
 * Page for booking courts at /client/book.
 * Integrates RealtimeGrid, BookingForm, and BookingConfirmationModal.
 *
 * @module @pages/client/BookingPage
 */

import { useState, useCallback, useEffect } from 'react';
import { useCourts } from '../../hooks/useCourts';
import { useRealtimeReservations } from '../../hooks/useRealtimeReservations';
import { createReservation } from '../../services/reservationService';
import { RealtimeGrid } from '../../components/reservations/RealtimeGrid/RealtimeGrid';
import { BookingForm } from '../../components/reservations/BookingForm/BookingForm';
import { BookingConfirmationModal } from '../../components/reservations/BookingConfirmationModal/BookingConfirmationModal';
import { StatsCards } from '../../components/reservations/StatsCards/StatsCards';
import { useNavigation } from '../../hooks/useNavigation';
import type { Court } from '../../types/court.types';
import type { Reservation } from '../../types/reservation.types';
import type { CreateReservationInput } from '../../types/service.types';

interface BookingPageState {
  isBookingFormOpen: boolean;
  selectedCourt: Court | null;
  selectedDate: Date | null;
  selectedHour: number | null;
  confirmationData: ConfirmationData | null;
}

interface ConfirmationData {
  court: Court;
  date: Date;
  startTime: string;
  endTime: string;
  type: Reservation['type'];
  participants: number;
  reservationId: string;
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
    console.error('[BookingPage] Error reading auth data:', error);
  }
  return null;
}

/**
 * Format hour for display
 */
function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

export function BookingPage(): JSX.Element {
  const { courts, isLoading: courtsLoading, error: courtsError } = useCourts();
  // Type assertion in useRealtimeReservations is validated by mapToReservation function
  const { reservations } = useRealtimeReservations();
  const navigation = useNavigation();

  const [state, setState] = useState<BookingPageState>({
    isBookingFormOpen: false,
    selectedCourt: null,
    selectedDate: null,
    selectedHour: null,
    confirmationData: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = getCurrentUserId();

  // Calculate stats
  const stats = {
    activeBookings: reservations.filter((r) => r.status === 'confirmed').length,
    maintenanceCount: courts.filter((c) => c.status === 'maintenance' || !c.is_active).length,
    availableSlots: calculateAvailableSlots(courts, reservations),
  };

  /**
   * Calculate available slots for today
   */
  function calculateAvailableSlots(courts: Court[], reservations: Reservation[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayReservations = reservations.filter((r) => {
      const resDate = r.start_time.toDate();
      return resDate >= today && resDate < tomorrow;
    });

    // Assume 12 time slots per court per day (8h-20h)
    const totalSlots = courts.length * 12;
    const bookedSlots = todayReservations.length;

    return Math.max(0, totalSlots - bookedSlots);
  }

  /**
   * Handle slot selection from grid
   */
  const handleSlotSelect = useCallback((court: Court, date: Date, hour: number) => {
    setState((prev) => ({
      ...prev,
      selectedCourt: court,
      selectedDate: date,
      selectedHour: hour,
      isBookingFormOpen: true,
    }));
  }, []);

  /**
   * Handle booking form submission
   */
  const handleBookingSubmit = async (data: {
    court: Court;
    date: Date;
    timeSlot: { start: Date; end: Date };
    type: Reservation['type'];
    participants: number;
    notes: string;
  }): Promise<void> => {
    if (!userId) {
      setError('Vous devez être connecté pour réserver');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const input: CreateReservationInput = {
        court_id: data.court.id,
        user_id: userId,
        start_time: data.timeSlot.start,
        end_time: data.timeSlot.end,
        type: data.type,
        participants: data.participants,
        description: data.notes || undefined,
        title: `Réservation - ${data.court.name}`,
      };

      const result = await createReservation(input);

      if (result.success && result.id) {
        setState((prev) => ({
          ...prev,
          confirmationData: {
            court: data.court,
            date: data.date,
            startTime: formatHour(data.timeSlot.start.getHours()),
            endTime: formatHour(data.timeSlot.end.getHours()),
            type: data.type,
            participants: data.participants,
            reservationId: result.id!,
          },
        }));
      } else {
        throw new Error(result.error || 'Échec de la réservation');
      }
    } catch (err) {
      console.error('[BookingPage] Error creating reservation:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Close booking form
   */
  const handleCloseBookingForm = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isBookingFormOpen: false,
      selectedCourt: null,
      selectedDate: null,
      selectedHour: null,
    }));
  }, []);

  /**
   * Close confirmation modal
   */
  const handleCloseConfirmation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      confirmationData: null,
    }));
    // Navigate to reservations page
    navigation.navigate('/client/reservations');
  }, [navigation]);

  if (courtsError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h2 className="font-headline text-xl font-bold text-on-surface">
          Erreur de chargement
        </h2>
        <p className="font-body text-body-sm text-on-surface-variant mt-2">
          {courtsError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Réserver un court</h1>
        <p className="font-body text-body-sm text-on-surface-variant mt-1">
          Sélectionnez un court et un horaire pour votre réservation
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        activeBookings={stats.activeBookings}
        maintenanceCount={stats.maintenanceCount}
        availableSlots={stats.availableSlots}
        isLoading={courtsLoading}
      />

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 p-4 rounded-lg bg-error-container text-on-error-container"
        >
          <span className="material-symbols-outlined">error</span>
          <span className="font-body text-body-sm">{error}</span>
        </div>
      )}

      {/* Realtime Grid */}
      <div className="rounded-xl bg-surface-container-lowest p-6 border border-surface-container-highest">
        <RealtimeGrid
          courts={courts}
          onSlotSelect={handleSlotSelect}
        />
      </div>

      {/* Booking Form Modal */}
      <BookingForm
        courts={courts}
        isOpen={state.isBookingFormOpen}
        onClose={handleCloseBookingForm}
        onSubmit={handleBookingSubmit}
        isLoading={isSubmitting}
      />

      {/* Confirmation Modal */}
      {state.confirmationData && (
        <BookingConfirmationModal
          isOpen={true}
          onClose={handleCloseConfirmation}
          court={state.confirmationData.court}
          date={state.confirmationData.date}
          startTime={state.confirmationData.startTime}
          endTime={state.confirmationData.endTime}
          type={state.confirmationData.type}
          participants={state.confirmationData.participants}
          reservationId={state.confirmationData.reservationId}
        />
      )}
    </div>
  );
}

export default BookingPage;

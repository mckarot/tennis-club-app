/**
 * Client Dashboard
 *
 * Main dashboard for client users.
 * Assembles all dashboard components: Hero, Stats, Court Grid, Reservations, etc.
 *
 * @module @pages/client/Dashboard
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { useClientDashboard } from '../../hooks/useClientDashboard';
import { DashboardHero } from '../../components/client/DashboardHero/DashboardHero';
import { StatsCardsGrid } from '../../components/client/StatsCardsGrid/StatsCardsGrid';
import { InteractiveCourtGrid } from '../../components/client/InteractiveCourtGrid/InteractiveCourtGrid';
import { UpcomingReservationsList } from '../../components/client/UpcomingReservationsList/UpcomingReservationsList';
import { ClubMaintenanceNote } from '../../components/client/ClubMaintenanceNote/ClubMaintenanceNote';
import { LocationWidget } from '../../components/client/LocationWidget/LocationWidget';
import { ClientDashboardErrorBoundary } from '../../components/ui/ErrorBoundary/ClientDashboardErrorBoundary';

export function Dashboard() {
  const navigate = useNavigate();
  const [isMaintenanceDismissed, setIsMaintenanceDismissed] = useState(false);

  const {
    // Stats
    stats,
    statsLoading,

    // Court grid
    courtGrid,
    gridLoading,

    // Upcoming reservations
    upcomingReservations,
    reservationsLoading,

    // Maintenance note
    maintenanceNote,

    // Location
    location,

    // User
    userName,

    // Actions
    handleBookNow,
    handleViewSchedule,
    handleCellClick,
    handleReservationClick,

    // Errors
    error,
  } = useClientDashboard();

  // Navigation handlers
  const onBookNowClick = useCallback(() => {
    handleBookNow();
    navigate('/client/courts');
  }, [handleBookNow, navigate]);

  const onViewScheduleClick = useCallback(() => {
    handleViewSchedule();
    navigate('/client/slots');
  }, [handleViewSchedule, navigate]);

  const onCellClick = useCallback(
    (cell: typeof courtGrid[0][0]) => {
      handleCellClick(cell);
      // Navigate to booking page with pre-selected court and time
      navigate(`/client/courts?court=${cell.courtId}&hour=${cell.hour}`);
    },
    [handleCellClick, navigate]
  );

  const onReservationClick = useCallback(
    (reservation: typeof upcomingReservations[0]) => {
      handleReservationClick(reservation);
      // Navigate to reservation details
      navigate(`/client/reservations/${reservation.id}`);
    },
    [handleReservationClick, navigate]
  );

  const onReservationCancel = useCallback(async (reservationId: string) => {
    try {
      const { getDbInstance } = await import('../../config/firebase.config');
      const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
      
      const db = getDbInstance();
      const reservationRef = doc(db, 'reservations', reservationId);
      
      await updateDoc(reservationRef, {
        status: 'cancelled',
        updated_at: Timestamp.now(),
      });
      
      console.log('[Dashboard] Reservation cancelled:', reservationId);
    } catch (error) {
      console.error('[Dashboard] Error cancelling reservation:', error);
      // Show error toast to user (implement toast notification here)
      alert('Erreur lors de l\'annulation de la réservation. Veuillez réessayer.');
    }
  }, []);

  const onMaintenanceDismiss = useCallback(() => {
    setIsMaintenanceDismissed(true);
  }, []);

  const onRetry = useCallback(() => {
    // Reload page or refresh data
    window.location.reload();
  }, []);

  return (
    <ClientDashboardErrorBoundary onRetry={onRetry}>
      <DashboardLayout role="client">
        <div className="space-y-6">
          {/* Hero Section */}
          <DashboardHero
            userName={userName}
            onBookNowClick={onBookNowClick}
            onViewScheduleClick={onViewScheduleClick}
          />

          {/* Stats Cards Grid */}
          <StatsCardsGrid stats={stats} loading={statsLoading} />

          {/* Interactive Court Grid */}
          <section aria-label="Disponibilité des courts" role="region">
            <h2 className="mb-4 font-headline text-headline-md font-bold text-on-surface">
              Disponibilité des courts
            </h2>
            <InteractiveCourtGrid
              cells={courtGrid}
              loading={gridLoading}
              onCellClick={onCellClick}
            />
          </section>

          {/* Upcoming Reservations */}
          <UpcomingReservationsList
            reservations={upcomingReservations}
            loading={reservationsLoading}
            onReservationClick={onReservationClick}
            onReservationCancel={onReservationCancel}
          />

          {/* Maintenance Note (if active and not dismissed) */}
          {maintenanceNote && !isMaintenanceDismissed && (
            <ClubMaintenanceNote note={maintenanceNote} onDismiss={onMaintenanceDismiss} />
          )}

          {/* Location Widget */}
          <LocationWidget location={location} />

          {/* Error Display (if any) */}
          {error && (
            <div
              className="rounded-xl bg-tertiary/10 p-4 text-tertiary"
              role="alert"
              aria-live="polite"
            >
              <p className="font-body text-body-sm">
                Une erreur est survenue : {error.message}
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ClientDashboardErrorBoundary>
  );
}

export default Dashboard;

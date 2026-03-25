/**
 * ClientDashboard Page
 * 
 * Main client dashboard page integrating all dashboard components
 * Layout: Hero → Stats → Court Grid (left) + Sidebar (right)
 */

import { motion, useReducedMotion } from 'framer-motion';
import { DashboardHero } from '../../components/client/DashboardHero/DashboardHero';
import { StatsCardsGrid } from '../../components/client/StatsCardsGrid/StatsCardsGrid';
import { InteractiveCourtGrid } from '../../components/client/InteractiveCourtGrid/InteractiveCourtGrid';
import { UpcomingReservationsList } from '../../components/client/UpcomingReservationsList/UpcomingReservationsList';
import { ClubMaintenanceNote } from '../../components/client/ClubMaintenanceNote/ClubMaintenanceNote';
import { LocationWidget } from '../../components/client/LocationWidget/LocationWidget';
import { useClientDashboard } from '../../hooks/useClientDashboard';

export function ClientDashboard(): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
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

  const pageVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.3,
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="min-h-screen bg-surface"
      role="main"
      aria-label="Tableau de bord client"
    >
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error-container text-on-error-container px-4 py-3 mb-4 rounded-lg"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            <p className="font-body text-body-sm">{error.message}</p>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <motion.section variants={sectionVariants}>
          <DashboardHero
            userName={userName}
            onBookNowClick={handleBookNow}
            onViewScheduleClick={handleViewSchedule}
          />
        </motion.section>

        {/* Stats Section */}
        <motion.section variants={sectionVariants}>
          <StatsCardsGrid
            stats={stats}
            isLoading={statsLoading}
          />
        </motion.section>

        {/* Maintenance Note */}
        {maintenanceNote && (
          <motion.section variants={sectionVariants}>
            <ClubMaintenanceNote
              note={maintenanceNote}
              onDismiss={() => {
                // In real implementation: dismiss the note
                console.log('Maintenance note dismissed');
              }}
            />
          </motion.section>
        )}

        {/* Main Content Grid */}
        <motion.section
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Court Grid - Takes 2/3 on large screens */}
          <div className="lg:col-span-2">
            <InteractiveCourtGrid
              grid={courtGrid}
              isLoading={gridLoading}
              onCellClick={handleCellClick}
            />
          </div>

          {/* Sidebar - Takes 1/3 on large screens */}
          <div className="space-y-6">
            {/* Upcoming Reservations */}
            <UpcomingReservationsList
              reservations={upcomingReservations}
              isLoading={reservationsLoading}
              onReservationClick={handleReservationClick}
            />

            {/* Location Widget */}
            <LocationWidget
              location={location}
              onGetDirections={() => {
                window.open(location.mapUrl, '_blank', 'noopener,noreferrer');
              }}
            />
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

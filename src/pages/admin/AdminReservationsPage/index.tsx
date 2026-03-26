/**
 * AdminReservationsPage
 *
 * Main page for admin reservations management.
 * Assembles all reservation management components.
 *
 * Features:
 * - Importer tous les composants
 * - Utiliser hooks useAdminReservations + useTodaysReservations
 * - Assembler dans layout :
 *   - ReservationStatsCards
 *   - ViewToggle
 *   - ReservationFilters
 *   - ReservationsCalendar
 *   - UpcomingTodaySidebar
 *   - EditReservationModal
 *   - CancelConfirmDialog
 *
 * @module @pages/admin/AdminReservationsPage
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAdminReservations } from '../../../hooks/useAdminReservations';
import { useTodaysReservations } from '../../../hooks/useTodaysReservations';
import { ViewToggle, type ViewMode } from '../components/ViewToggle';
import { ReservationStatsCards } from '../components/ReservationStatsCards';
import { ReservationFilters } from '../components/ReservationFilters';
import { ReservationsCalendar } from '../components/ReservationsCalendar';
import { UpcomingTodaySidebar } from '../components/UpcomingTodaySidebar';
import { EditReservationModal } from '../components/EditReservationModal';
import { CancelConfirmDialog } from '../components/CancelConfirmDialog';
import type { EditReservationInput, CancelReservationInput } from '../../../hooks/useAdminReservations';

export function AdminReservationsPage() {
  // Main reservations hook
  const {
    filteredReservations,
    users,
    courts,
    isLoading,
    isSubmitting,
    error,
    filters,
    setFilters,
    updateReservation,
    cancelReservation,
    completeReservation,
    isEditModalOpen,
    isCancelDialogOpen,
    selectedReservation,
    openEditModal,
    closeEditModal,
    openCancelDialog,
    closeCancelDialog,
  } = useAdminReservations();

  // Today's reservations hook for sidebar
  const {
    reservations: todaysReservations,
    isLoading: isTodaysLoading,
  } = useTodaysReservations();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('today');

  // Calculate stats from filtered reservations
  const stats = useMemo(() => {
    const activeBookings = filteredReservations.filter(
      (res) => res.status === 'confirmed' || res.status === 'pending'
    ).length;

    const maintenance = filteredReservations.filter(
      (res) => res.type === 'maintenance'
    ).length;

    // Calculate available slots (simplified - in real app would calculate from court hours)
    const totalSlots = 5 * 16; // 5 courts × 16 hours (6am-10pm)
    const bookedSlots = filteredReservations.length;
    const availableSlots = Math.max(0, totalSlots - bookedSlots);

    return {
      activeBookings,
      maintenance,
      availableSlots,
      activeBookingsTrend: 12, // Example trend
      maintenanceTrend: -50,
      availableSlotsTrend: -5,
    };
  }, [filteredReservations]);

  /**
   * Handle edit reservation save
   */
  const handleEditSave = async (data: EditReservationInput) => {
    try {
      if (!selectedReservation?.id) return;

      const result = await updateReservation(selectedReservation.id, data);
      if (!result.success) {
        console.error('[AdminReservationsPage] Edit failed:', result.error);
      }
    } catch (err) {
      console.error('[AdminReservationsPage] Edit exception:', err);
    }
  };

  /**
   * Handle cancel reservation confirm
   */
  const handleCancelConfirm = async (reason: string, sendNotification: boolean) => {
    try {
      if (!selectedReservation?.id) return;

      const input: CancelReservationInput = { reason, sendNotification };
      const result = await cancelReservation(selectedReservation.id, input);
      if (!result.success) {
        console.error('[AdminReservationsPage] Cancel failed:', result.error);
      }
    } catch (err) {
      console.error('[AdminReservationsPage] Cancel exception:', err);
    }
  };

  /**
   * Handle complete reservation
   */
  const handleComplete = async (reservationId: string) => {
    try {
      const result = await completeReservation(reservationId);
      if (!result.success) {
        console.error('[AdminReservationsPage] Complete failed:', result.error);
      }
    } catch (err) {
      console.error('[AdminReservationsPage] Complete exception:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          Reservations Management
        </h1>
        <p className="mt-1 font-body text-sm text-on-surface-variant">
          Manage all court reservations and bookings
        </p>
      </motion.div>

      {/* Error Banner */}
      {error && (
        <motion.div
          role="alert"
          className="rounded-lg bg-error-container p-4 text-on-error-container"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            <span className="font-body text-sm">{error.message}</span>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <ReservationStatsCards stats={stats} isLoading={isLoading} />

      {/* Main Content Area */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left Column: Calendar and Filters */}
        <main className="flex-1 space-y-6">
          {/* View Toggle */}
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />

          {/* Filters */}
          <ReservationFilters
            filters={filters}
            courts={courts}
            onFilterChange={setFilters}
          />

          {/* Calendar */}
          <ReservationsCalendar
            reservations={filteredReservations}
            courts={courts}
            users={users}
            viewMode={viewMode}
            isLoading={isLoading}
            onEdit={openEditModal}
            onCancel={openCancelDialog}
            onComplete={handleComplete}
          />
        </main>

        {/* Right Column: Today's Sidebar */}
        <UpcomingTodaySidebar
          reservations={todaysReservations}
          users={users}
          courts={courts}
          isLoading={isTodaysLoading}
          onEdit={openEditModal}
          onCancel={openCancelDialog}
          onComplete={handleComplete}
        />
      </div>

      {/* Edit Modal */}
      <EditReservationModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        reservation={selectedReservation}
        courts={courts}
        onSave={handleEditSave}
        isSaving={isSubmitting}
      />

      {/* Cancel Dialog */}
      <CancelConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={closeCancelDialog}
        reservation={selectedReservation}
        onConfirm={handleCancelConfirm}
        isConfirming={isSubmitting}
      />
    </div>
  );
}

export default AdminReservationsPage;

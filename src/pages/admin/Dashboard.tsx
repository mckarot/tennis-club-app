/**
 * Admin Dashboard
 *
 * Main command center dashboard for admin users.
 * Assembles all admin dashboard components with real-time data.
 *
 * Features:
 * - Real-time stats from useAdminDashboard
 * - Court utilization chart from useCourtUtilization
 * - Court deployment grid from useCourtDeployment
 * - User directory from useUserDirectory
 * - Block court panel
 * - Live timestamp (America/Martinique)
 * - Error boundary for error handling
 * - Framer Motion animations
 * - ARIA labels for accessibility
 *
 * @module @pages/admin/Dashboard
 */

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../components/layout';
import { AdminErrorBoundary } from '../../components/ui/ErrorBoundary/AdminErrorBoundary';
import { LiveTimestamp } from './components/AdminDashboard/LiveTimestamp';
import { SeedDataButton } from '../../components/SeedDataButton/SeedDataButton';
import { StatsCardsGrid } from './components/AdminDashboard/StatsCardsGrid';
import { CourtUtilizationChart } from './components/AdminDashboard/CourtUtilizationChart';
import { BlockCourtPanel } from './components/AdminDashboard/BlockCourtPanel';
import { CourtDeploymentGrid } from './components/AdminDashboard/CourtDeploymentGrid';
import { UserDirectoryTable } from './components/AdminDashboard/UserDirectoryTable';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { useCourtUtilization } from '../../hooks/useCourtUtilization';
import { useCourtDeployment } from '../../hooks/useCourtDeployment';
import { useUserDirectory } from '../../hooks/useUserDirectory';
import { blockCourtForMaintenance } from '../../services/adminService';
import type { BlockCourtFormData } from './components/AdminDashboard/BlockCourtPanel';

/**
 * Dashboard component
 */
export function Dashboard(): JSX.Element {
  // Hook: Admin Dashboard Stats
  const { stats, isLoading: statsLoading, error: statsError } = useAdminDashboard();

  // Hook: Court Utilization
  const {
    data: utilizationData,
    isLoading: utilizationLoading,
    error: utilizationError,
  } = useCourtUtilization();

  // Hook: Court Deployment
  const {
    courts,
    isLoading: courtsLoading,
    error: courtsError,
    onToggleMaintenance,
    refreshCourts,
  } = useCourtDeployment();

  // Hook: User Directory
  const {
    filteredUsers,
    isLoading: usersLoading,
    error: usersError,
    searchQuery,
    filters,
    pagination,
    onSearch,
    onFilter,
    onPageChange,
  } = useUserDirectory();

  /**
   * Handle block court submission
   */
  const handleBlockCourt = useCallback(
    async (data: BlockCourtFormData): Promise<void> => {
      try {
        // Convert time strings to Date objects (today's date with selected time)
        const today = new Date();
        const [startHours, startMinutes] = data.startTime.split(':').map(Number);
        const [endHours, endMinutes] = data.endTime.split(':').map(Number);

        const startTime = new Date(today);
        startTime.setHours(startHours, startMinutes, 0, 0);

        const endTime = new Date(today);
        endTime.setHours(endHours, endMinutes, 0, 0);

        // Call admin service to block court for maintenance
        const result = await blockCourtForMaintenance({
          courtId: data.courtId,
          startTime,
          endTime,
          title: data.reason,
          description: `Court blocked for ${data.type}: ${data.reason}`,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to block court');
        }

        console.log('[Dashboard] Court blocked successfully:', result.data);

        // Refresh courts data to reflect the maintenance status
        await refreshCourts();
      } catch (err) {
        console.error('[Dashboard] handleBlockCourt error:', err);
        throw err;
      }
    },
    [refreshCourts]
  );

  /**
   * Handle error from ErrorBoundary
   */
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo): void => {
    console.error('[Dashboard] Error caught by boundary:', error, errorInfo);
  }, []);

  /**
   * Handle reset from ErrorBoundary
   */
  const handleReset = useCallback((): void => {
    window.location.reload();
  }, []);

  return (
    <AdminErrorBoundary onError={handleError} onReset={handleReset}>
      <DashboardLayout role="admin">
        <div className="space-y-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
                COMMAND CENTER
              </h1>
              <p className="font-body text-sm text-on-surface-variant">
                Real-time club supervision and management
              </p>
            </div>
            <div className="flex items-center gap-4">
              <LiveTimestamp />
              <SeedDataButton />
            </div>
          </motion.header>

          {/* Stats Cards */}
        <StatsCardsGrid stats={stats} isLoading={statsLoading} />

        {/* Court Utilization Chart */}
        <CourtUtilizationChart
          data={utilizationData}
          isLoading={utilizationLoading}
        />

        {/* Court Management Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Block Court Panel */}
          <BlockCourtPanel
            courts={courts}
            onSubmit={handleBlockCourt}
            isLoading={courtsLoading}
          />

          {/* Court Deployment Grid */}
          <div>
            <div className="mb-4">
              <h2 className="font-headline text-lg font-bold italic uppercase text-on-surface">
                COURT DEPLOYMENT
              </h2>
              <p className="font-body text-sm text-on-surface-variant">
                Toggle maintenance state for each court
              </p>
            </div>
            <CourtDeploymentGrid
              courts={courts}
              onToggle={onToggleMaintenance}
              isLoading={courtsLoading}
            />
          </div>
        </div>

        {/* User Directory */}
        <UserDirectoryTable
          users={filteredUsers}
          isLoading={usersLoading}
          searchQuery={searchQuery}
          filters={filters}
          pagination={pagination}
          onSearch={onSearch}
          onFilter={onFilter}
          onPageChange={onPageChange}
        />
      </div>
      </DashboardLayout>
    </AdminErrorBoundary>
  );
}

export default Dashboard;

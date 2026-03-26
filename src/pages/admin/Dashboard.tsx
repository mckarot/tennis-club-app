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
import { AdminErrorBoundary } from '../../components/ui/ErrorBoundary/AdminErrorBoundary';
import { LiveTimestamp } from './components/AdminDashboard/LiveTimestamp';
import { StatsCardsGrid } from './components/AdminDashboard/StatsCardsGrid';
import { CourtUtilizationChart } from './components/AdminDashboard/CourtUtilizationChart';
import { BlockCourtPanel } from './components/AdminDashboard/BlockCourtPanel';
import { CourtDeploymentGrid } from './components/AdminDashboard/CourtDeploymentGrid';
import { UserDirectoryTable } from './components/AdminDashboard/UserDirectoryTable';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { useCourtUtilization } from '../../hooks/useCourtUtilization';
import { useCourtDeployment } from '../../hooks/useCourtDeployment';
import { useUserDirectory } from '../../hooks/useUserDirectory';
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
        console.log('[Dashboard] Block court submitted:', data);
        // TODO: Implement court blocking logic with Firebase
        // This would create a maintenance reservation
      } catch (err) {
        console.error('[Dashboard] handleBlockCourt error:', err);
        throw err;
      }
    },
    []
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
      <div className="space-y-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              COMMAND CENTER
            </h1>
            <p className="font-body text-sm text-on-surface-variant">
              Real-time club supervision and management
            </p>
          </div>
          <LiveTimestamp />
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
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Court Deployment
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
    </AdminErrorBoundary>
  );
}

export default Dashboard;

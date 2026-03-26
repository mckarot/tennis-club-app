/**
 * Admin E2E Test Fixtures
 *
 * Common helpers and fixtures for admin dashboard E2E tests.
 * Provides reusable utilities for admin workflow testing.
 *
 * Features:
 * - Admin authentication helper
 * - Common selectors and data-testid helpers
 * - Utility functions for admin operations
 * - Wait helpers for real-time updates
 *
 * @module @tests/e2e/fixtures/admin-fixtures
 */

import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Admin test user credentials
 * In production, these would come from environment variables
 */
export const ADMIN_CREDENTIALS = {
  email: 'admin@tennis-club.fr',
  password: 'AdminPassword123!',
};

/**
 * Admin dashboard selectors using data-testid attributes
 */
export const AdminSelectors = {
  // Dashboard elements
  dashboardHeader: '[data-testid="admin-dashboard-header"]',
  liveTimestamp: '[data-testid="live-timestamp"]',
  statsCards: '[data-testid="stats-cards-grid"]',
  
  // Court Utilization
  courtUtilizationChart: '[data-testid="court-utilization-chart"]',
  utilizationBars: '[data-testid="utilization-bar"]',
  utilizationRate: '[data-testid="utilization-rate"]',
  
  // Court Deployment
  courtDeploymentGrid: '[data-testid="court-deployment-grid"]',
  courtCell: '[data-testid="court-cell"]',
  maintenanceToggle: '[data-testid="maintenance-toggle"]',
  courtStatusBadge: '[data-testid="court-status-badge"]',
  
  // Block Court Panel
  blockCourtPanel: '[data-testid="block-court-panel"]',
  courtSelect: '[data-testid="court-select"]',
  startTimeSelect: '[data-testid="start-time-select"]',
  endTimeSelect: '[data-testid="end-time-select"]',
  reasonInput: '[data-testid="reason-input"]',
  blockCourtButton: '[data-testid="block-court-button"]',
  blockCourtSuccess: '[data-testid="block-court-success"]',
  blockCourtError: '[data-testid="block-court-error"]',
  
  // User Directory
  userDirectoryTable: '[data-testid="user-directory-table"]',
  userSearchInput: '[data-testid="user-search-input"]',
  userRoleFilter: '[data-testid="user-role-filter"]',
  userStatusFilter: '[data-testid="user-status-filter"]',
  userTableRow: '[data-testid="user-table-row"]',
  paginationControls: '[data-testid="pagination-controls"]',
  
  // Error Boundary
  errorBoundary: '[data-testid="error-boundary"]',
  errorRetryButton: '[data-testid="error-retry-button"]',
  errorBackButton: '[data-testid="error-back-button"]',
  
  // Loading states
  loadingSpinner: '[data-testid="loading-spinner"]',
  loadingSkeleton: '[data-testid="loading-skeleton"]',
};

/**
 * Wait for dashboard to fully load
 */
export async function waitForDashboardLoad(page: Page): Promise<void> {
  await expect(page.locator(AdminSelectors.dashboardHeader)).toBeVisible({ timeout: 30000 });
  await expect(page.locator(AdminSelectors.statsCards)).toBeVisible({ timeout: 10000 });
}

/**
 * Wait for real-time updates to propagate
 */
export async function waitForRealtimeUpdate(page: Page, timeout = 5000): Promise<void> {
  await page.waitForTimeout(timeout);
}

/**
 * Wait for loading state to complete
 */
export async function waitForLoadingComplete(page: Page): Promise<void> {
  const loadingSpinner = page.locator(AdminSelectors.loadingSpinner);
  const loadingSkeleton = page.locator(AdminSelectors.loadingSkeleton);
  
  await expect(loadingSpinner).toBeHidden({ timeout: 30000 });
  await expect(loadingSkeleton).toBeHidden({ timeout: 30000 });
}

/**
 * Navigate to admin dashboard
 */
export async function navigateToAdminDashboard(page: Page): Promise<void> {
  await page.goto('/admin');
  await waitForDashboardLoad(page);
}

/**
 * Mock admin authentication
 * In production, this would perform actual login
 */
export async function authenticateAsAdmin(page: Page): Promise<void> {
  // For E2E tests with Firebase Emulator, we assume admin is already authenticated
  // or use a test helper to set up auth state
  await page.evaluate(() => {
    // This would be implemented with your auth setup
    localStorage.setItem('test_admin_auth', 'true');
  });
}

/**
 * Select a court from the dropdown
 */
export async function selectCourt(
  page: Page,
  courtNumber: number
): Promise<void> {
  const courtSelect = page.locator(AdminSelectors.courtSelect);
  await courtSelect.selectOption({ value: `court_${courtNumber}` });
}

/**
 * Set time range for court blocking
 */
export async function setTimeRange(
  page: Page,
  startTime: string,
  endTime: string
): Promise<void> {
  const startSelect = page.locator(AdminSelectors.startTimeSelect);
  const endSelect = page.locator(AdminSelectors.endTimeSelect);
  
  await startSelect.selectOption({ value: startTime });
  await endSelect.selectOption({ value: endTime });
}

/**
 * Fill block court form
 */
export async function fillBlockCourtForm(
  page: Page,
  courtNumber: number,
  startTime: string,
  endTime: string,
  reason: string
): Promise<void> {
  await selectCourt(page, courtNumber);
  await setTimeRange(page, startTime, endTime);
  
  const reasonInput = page.locator(AdminSelectors.reasonInput);
  await reasonInput.fill(reason);
}

/**
 * Submit block court form
 */
export async function submitBlockCourt(page: Page): Promise<void> {
  const blockButton = page.locator(AdminSelectors.blockCourtButton);
  await blockButton.click();
}

/**
 * Wait for block court operation to complete
 */
export async function waitForBlockCourtComplete(page: Page): Promise<void> {
  // Wait for success message or error
  const successMessage = page.locator(AdminSelectors.blockCourtSuccess);
  const errorMessage = page.locator(AdminSelectors.blockCourtError);
  
  await Promise.race([
    expect(successMessage).toBeVisible({ timeout: 10000 }),
    expect(errorMessage).toBeVisible({ timeout: 10000 }),
  ]);
}

/**
 * Toggle court maintenance status
 */
export async function toggleCourtMaintenance(
  page: Page,
  courtNumber: number
): Promise<void> {
  const courtCell = page.locator(`${AdminSelectors.courtCell}[data-court-number="${courtNumber}"]`);
  const toggle = courtCell.locator(AdminSelectors.maintenanceToggle);
  await toggle.click();
  await waitForRealtimeUpdate(page);
}

/**
 * Search users in directory
 */
export async function searchUsers(page: Page, query: string): Promise<void> {
  const searchInput = page.locator(AdminSelectors.userSearchInput);
  await searchInput.fill(query);
  await waitForRealtimeUpdate(page, 2000);
}

/**
 * Filter users by role
 */
export async function filterUsersByRole(
  page: Page,
  role: 'admin' | 'moniteur' | 'client'
): Promise<void> {
  const roleFilter = page.locator(AdminSelectors.userRoleFilter);
  await roleFilter.selectOption({ value: role });
  await waitForRealtimeUpdate(page, 2000);
}

/**
 * Get user row count
 */
export async function getUserRowCount(page: Page): Promise<number> {
  const userRows = page.locator(AdminSelectors.userTableRow);
  return userRows.count();
}

/**
 * Verify court status in deployment grid
 */
export async function verifyCourtStatus(
  page: Page,
  courtNumber: number,
  expectedStatus: 'active' | 'maintenance' | 'closed'
): Promise<void> {
  const courtCell = page.locator(`${AdminSelectors.courtCell}[data-court-number="${courtNumber}"]`);
  const statusBadge = courtCell.locator(AdminSelectors.courtStatusBadge);
  await expect(statusBadge).toHaveText(expectedStatus.toUpperCase());
}

/**
 * Take screenshot on failure helper
 */
export async function takeFailureScreenshot(
  page: Page,
  testName: string
): Promise<void> {
  await page.screenshot({
    path: `test-results/failed-${testName}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Record video on failure helper
 */
export async function startVideoRecording(page: Page): Promise<void> {
  // Video recording is configured in playwright.config.ts
  // This is a placeholder for manual recording triggers
}

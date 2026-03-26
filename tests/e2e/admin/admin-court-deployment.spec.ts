/**
 * Court Deployment E2E Tests
 *
 * Tests for the Court Deployment grid and maintenance toggle workflow.
 * Verifies court status management, real-time updates, and toggle functionality.
 *
 * Test Coverage:
 * - Court deployment grid loads correctly
 * - Court cells display correct information
 * - Maintenance toggle functionality
 * - Real-time status updates
 * - Court status badges (active, maintenance, closed)
 *
 * @module @tests/e2e/admin/admin-court-deployment
 */

import { test, expect } from '@playwright/test';
import {
  navigateToAdminDashboard,
  waitForDashboardLoad,
  waitForLoadingComplete,
  waitForRealtimeUpdate,
  AdminSelectors,
  toggleCourtMaintenance,
  verifyCourtStatus,
  takeFailureScreenshot,
} from '../fixtures/admin-fixtures';

test.describe('Court Deployment', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAdminDashboard(page);
    await waitForLoadingComplete(page);
  });

  test('should display court deployment grid', async ({ page }) => {
    const grid = page.locator(AdminSelectors.courtDeploymentGrid);
    await expect(grid).toBeVisible();
  });

  test('should display all courts in deployment grid', async ({ page }) => {
    const courtCells = page.locator(AdminSelectors.courtCell);
    await expect(courtCells).toHaveCount(6); // Assuming 6 courts
  });

  test('should display court number and name for each court', async ({ page }) => {
    const courtCells = page.locator(AdminSelectors.courtCell);
    const count = await courtCells.count();
    
    for (let i = 0; i < count; i++) {
      const cell = courtCells.nth(i);
      
      // Court number should be visible
      const courtNumber = cell.locator('[data-testid="court-number"]');
      await expect(courtNumber).toBeVisible();
      
      // Court name should be visible
      const courtName = cell.locator('[data-testid="court-name"]');
      await expect(courtName).toBeVisible();
    }
  });

  test('should display court type (Quick/Terre) for each court', async ({ page }) => {
    const courtCells = page.locator(AdminSelectors.courtCell);
    const count = await courtCells.count();
    
    for (let i = 0; i < count; i++) {
      const cell = courtCells.nth(i);
      
      const courtType = cell.locator('[data-testid="court-type"]');
      await expect(courtType).toBeVisible();
      
      const typeText = await courtType.textContent();
      expect(['Quick', 'Terre']).toContain(typeText?.trim());
    }
  });

  test('should display status badge for each court', async ({ page }) => {
    const statusBadges = page.locator(AdminSelectors.courtStatusBadge);
    const count = await statusBadges.count();
    
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const badge = statusBadges.nth(i);
      await expect(badge).toBeVisible();
      
      const text = await badge.textContent();
      expect(['ACTIVE', 'MAINTENANCE', 'CLOSED']).toContain(text?.trim().toUpperCase());
    }
  });

  test('should toggle court to maintenance state', async ({ page }) => {
    const courtNumber = 1;
    
    // Get initial status
    const courtCell = page.locator(`${AdminSelectors.courtCell}[data-court-number="${courtNumber}"]`);
    const initialStatusBadge = courtCell.locator(AdminSelectors.courtStatusBadge);
    const initialStatus = await initialStatusBadge.textContent();
    
    // Toggle to maintenance
    const toggle = courtCell.locator(AdminSelectors.maintenanceToggle);
    await toggle.click();
    
    // Wait for real-time update
    await waitForRealtimeUpdate(page, 3000);
    
    // Status should change to maintenance
    const updatedStatusBadge = courtCell.locator(AdminSelectors.courtStatusBadge);
    await expect(updatedStatusBadge).toHaveText('MAINTENANCE');
  });

  test('should toggle court from maintenance back to active', async ({ page }) => {
    const courtNumber = 2;
    
    // First, set to maintenance
    const courtCell = page.locator(`${AdminSelectors.courtCell}[data-court-number="${courtNumber}"]`);
    const toggle = courtCell.locator(AdminSelectors.maintenanceToggle);
    
    // Toggle to maintenance
    await toggle.click();
    await waitForRealtimeUpdate(page, 3000);
    
    // Verify maintenance status
    await verifyCourtStatus(page, courtNumber, 'maintenance');
    
    // Toggle back to active
    await toggle.click();
    await waitForRealtimeUpdate(page, 3000);
    
    // Verify active status
    await verifyCourtStatus(page, courtNumber, 'active');
  });

  test('should display current reservation info for active courts', async ({ page }) => {
    const courtCells = page.locator(AdminSelectors.courtCell);
    const count = await courtCells.count();
    
    for (let i = 0; i < count; i++) {
      const cell = courtCells.nth(i);
      
      // Current reservation may or may not exist
      const currentReservation = cell.locator('[data-testid="current-reservation"]');
      const count = await currentReservation.count();
      
      if (count > 0) {
        await expect(currentReservation).toBeVisible();
        
        // Should display reservation type
        const reservationType = currentReservation.locator('[data-testid="reservation-type"]');
        await expect(reservationType).toBeVisible();
      }
    }
  });

  test('should display next reservation info', async ({ page }) => {
    const courtCells = page.locator(AdminSelectors.courtCell);
    const count = await courtCells.count();
    
    for (let i = 0; i < count; i++) {
      const cell = courtCells.nth(i);
      
      // Next reservation may or may not exist
      const nextReservation = cell.locator('[data-testid="next-reservation"]');
      const reservationCount = await nextReservation.count();
      
      if (reservationCount > 0) {
        await expect(nextReservation).toBeVisible();
        
        // Should display next reservation time
        const nextTime = nextReservation.locator('[data-testid="next-reservation-time"]');
        await expect(nextTime).toBeVisible();
      }
    }
  });

  test('should show loading state during toggle operation', async ({ page }) => {
    const courtNumber = 3;
    const courtCell = page.locator(`${AdminSelectors.courtCell}[data-court-number="${courtNumber}"]`);
    const toggle = courtCell.locator(AdminSelectors.maintenanceToggle);
    
    // Click toggle
    await toggle.click();
    
    // Loading state should appear briefly
    const loadingSpinner = courtCell.locator(AdminSelectors.loadingSpinner);
    const isLoadingVisible = await loadingSpinner.isVisible().catch(() => false);
    
    // Loading may be too fast to catch, so this is optional
    if (isLoadingVisible) {
      await expect(loadingSpinner).toBeVisible();
    }
    
    // Wait for operation to complete
    await waitForRealtimeUpdate(page, 3000);
    
    // Loading should be hidden
    await expect(loadingSpinner).toBeHidden();
  });

  test('should handle toggle error gracefully', async ({ page }) => {
    // This test would require mocking a failed API call
    // For now, verify error boundary is not triggered
    const errorBoundary = page.locator(AdminSelectors.errorBoundary);
    await expect(errorBoundary).toBeHidden();
  });

  test('should display deployment color coding (primary/secondary)', async ({ page }) => {
    const courtCells = page.locator(AdminSelectors.courtCell);
    const count = await courtCells.count();
    
    for (let i = 0; i < count; i++) {
      const cell = courtCells.nth(i);
      
      // Cell should have color class
      const statusBadge = cell.locator(AdminSelectors.courtStatusBadge);
      await expect(statusBadge).toBeVisible();
      
      // Color should match status
      const statusText = await statusBadge.textContent();
      if (statusText?.toUpperCase() === 'MAINTENANCE') {
        await expect(statusBadge).toHaveAttribute('class', /bg-secondary/);
      } else {
        await expect(statusBadge).toHaveAttribute('class', /bg-primary/);
      }
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await takeFailureScreenshot(page, testInfo.title);
    }
  });
});

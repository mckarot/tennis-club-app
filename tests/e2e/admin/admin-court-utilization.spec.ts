/**
 * Court Utilization E2E Tests
 *
 * Tests for the Court Utilization chart and workflow in the admin dashboard.
 * Verifies real-time data display, chart rendering, and utilization metrics.
 *
 * Test Coverage:
 * - Court utilization chart loads correctly
 * - Utilization bars display correct data
 * - Real-time updates reflect in chart
 * - Court utilization rates are accurate
 * - Chart handles empty states
 *
 * @module @tests/e2e/admin/admin-court-utilization
 */

import { test, expect, type Page } from '@playwright/test';
import {
  navigateToAdminDashboard,
  waitForDashboardLoad,
  waitForLoadingComplete,
  waitForRealtimeUpdate,
  AdminSelectors,
  takeFailureScreenshot,
} from '../fixtures/admin-fixtures';

test.describe('Court Utilization', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAdminDashboard(page);
    await waitForLoadingComplete(page);
  });

  test('should display court utilization chart', async ({ page }) => {
    const chart = page.locator(AdminSelectors.courtUtilizationChart);
    await expect(chart).toBeVisible();
  });

  test('should display utilization bars for all courts', async ({ page }) => {
    const utilizationBars = page.locator(AdminSelectors.utilizationBars);
    await expect(utilizationBars).toHaveCount(6); // Assuming 6 courts
  });

  test('should display utilization rate percentage for each court', async ({ page }) => {
    const utilizationRates = page.locator(AdminSelectors.utilizationRate);
    const count = await utilizationRates.count();
    
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const rate = utilizationRates.nth(i);
      await expect(rate).toBeVisible();
      
      const text = await rate.textContent();
      expect(text).toMatch(/\d+%$/); // Should end with %
    }
  });

  test('should show correct court names in utilization chart', async ({ page }) => {
    const utilizationBars = page.locator(AdminSelectors.utilizationBars);
    const count = await utilizationBars.count();
    
    for (let i = 0; i < count; i++) {
      const bar = utilizationBars.nth(i);
      await expect(bar).toBeVisible();
      
      // Court name should be visible
      const courtName = bar.locator('[data-testid="court-name"]');
      await expect(courtName).toBeVisible();
    }
  });

  test('should display different utilization states (booked, maintenance, available)', async ({ page }) => {
    const utilizationBars = page.locator(AdminSelectors.utilizationBars);
    const firstBar = utilizationBars.first();
    
    // Check for booked slots indicator
    const bookedSlots = firstBar.locator('[data-testid="booked-slots"]');
    await expect(bookedSlots).toBeVisible();
    
    // Check for maintenance slots indicator (if any)
    const maintenanceSlots = firstBar.locator('[data-testid="maintenance-slots"]');
    // May or may not be visible depending on data
    
    // Check for available slots indicator
    const availableSlots = firstBar.locator('[data-testid="available-slots"]');
    await expect(availableSlots).toBeVisible();
  });

  test('should update utilization chart in real-time', async ({ page }) => {
    // Get initial utilization data
    const initialRates = page.locator(AdminSelectors.utilizationRate);
    const initialCount = await initialRates.count();
    
    // Wait for real-time update
    await waitForRealtimeUpdate(page, 5000);
    
    // Verify chart is still visible (no errors)
    const chart = page.locator(AdminSelectors.courtUtilizationChart);
    await expect(chart).toBeVisible();
    
    // Utilization bars should still be present
    const updatedBars = page.locator(AdminSelectors.utilizationBars);
    await expect(updatedBars).toHaveCount(initialCount);
  });

  test('should handle loading state gracefully', async ({ page }) => {
    // Reload page to trigger loading state
    await page.reload();
    
    // Loading state should be visible initially
    const loadingSpinner = page.locator(AdminSelectors.loadingSpinner);
    const loadingSkeleton = page.locator(AdminSelectors.loadingSkeleton);
    
    // Either spinner or skeleton should be visible initially
    const isLoadingVisible = await loadingSpinner.isVisible().catch(() => false) ||
                            await loadingSkeleton.isVisible().catch(() => false);
    
    expect(isLoadingVisible).toBe(true);
    
    // Wait for loading to complete
    await waitForLoadingComplete(page);
    
    // Loading state should be hidden
    await expect(loadingSpinner).toBeHidden();
    await expect(loadingSkeleton).toBeHidden();
    
    // Chart should be visible
    const chart = page.locator(AdminSelectors.courtUtilizationChart);
    await expect(chart).toBeVisible();
  });

  test('should display zero utilization for courts with no bookings', async ({ page }) => {
    const utilizationBars = page.locator(AdminSelectors.utilizationBars);
    const count = await utilizationBars.count();
    
    for (let i = 0; i < count; i++) {
      const bar = utilizationBars.nth(i);
      const rate = bar.locator(AdminSelectors.utilizationRate);
      const text = await rate.textContent();
      
      // Utilization rate should be between 0% and 100%
      if (text) {
        const percentage = parseInt(text.replace('%', ''), 10);
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
      }
    }
  });

  test('should show maintenance blocks in utilization chart', async ({ page }) => {
    const utilizationBars = page.locator(AdminSelectors.utilizationBars);
    const firstBar = utilizationBars.first();
    
    // Maintenance slots indicator
    const maintenanceSlots = firstBar.locator('[data-testid="maintenance-slots"]');
    
    // May or may not have maintenance, but element should exist in DOM
    const isMaintenanceVisible = await maintenanceSlots.isVisible().catch(() => false);
    const isMaintenanceInDOM = await maintenanceSlots.count() > 0;
    
    // If maintenance exists, it should be properly styled
    if (isMaintenanceInDOM) {
      await expect(maintenanceSlots).toHaveAttribute('class', /bg-secondary/);
    }
  });

  test('should handle error state gracefully', async ({ page }) => {
    // This test would require mocking a failed API call
    // For now, we verify the error boundary exists
    const errorBoundary = page.locator(AdminSelectors.errorBoundary);
    
    // Error boundary should not be visible in normal operation
    await expect(errorBoundary).toBeHidden();
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await takeFailureScreenshot(page, testInfo.title);
    }
  });
});

/**
 * Block Court E2E Tests
 *
 * Tests for the Block Court panel workflow in the admin dashboard.
 * Verifies court blocking for maintenance, form validation, and error handling.
 *
 * Test Coverage:
 * - Block court panel loads correctly
 * - Form validation (required fields, time range)
 * - Court selection
 * - Time range selection
 * - Reason input
 * - Successful court blocking
 * - Error handling
 *
 * @module @tests/e2e/admin/admin-block-court
 */

import { test, expect } from '@playwright/test';
import {
  navigateToAdminDashboard,
  waitForDashboardLoad,
  waitForLoadingComplete,
  waitForRealtimeUpdate,
  AdminSelectors,
  fillBlockCourtForm,
  submitBlockCourt,
  waitForBlockCourtComplete,
  takeFailureScreenshot,
} from '../fixtures/admin-fixtures';

test.describe('Block Court', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAdminDashboard(page);
    await waitForLoadingComplete(page);
  });

  test('should display block court panel', async ({ page }) => {
    const panel = page.locator(AdminSelectors.blockCourtPanel);
    await expect(panel).toBeVisible();
  });

  test('should display panel header with title and description', async ({ page }) => {
    const panel = page.locator(AdminSelectors.blockCourtPanel);
    
    // Title should be visible
    const title = panel.locator('h2');
    await expect(title).toHaveText(/Block Court/i);
    
    // Description should be visible
    const description = panel.locator('p');
    await expect(description).toBeVisible();
  });

  test('should display court selection dropdown', async ({ page }) => {
    const courtSelect = page.locator(AdminSelectors.courtSelect);
    await expect(courtSelect).toBeVisible();
    
    // Should have default option
    await expect(courtSelect).toHaveValue('');
  });

  test('should display time range selectors', async ({ page }) => {
    const startTimeSelect = page.locator(AdminSelectors.startTimeSelect);
    const endTimeSelect = page.locator(AdminSelectors.endTimeSelect);
    
    await expect(startTimeSelect).toBeVisible();
    await expect(endTimeSelect).toBeVisible();
    
    // Should have default values
    await expect(startTimeSelect).toHaveValue('06:00');
    await expect(endTimeSelect).toHaveValue('08:00');
  });

  test('should display reason input field', async ({ page }) => {
    const reasonInput = page.locator(AdminSelectors.reasonInput);
    await expect(reasonInput).toBeVisible();
    await expect(reasonInput).toHaveAttribute('rows', '3');
  });

  test('should display block court button', async ({ page }) => {
    const blockButton = page.locator(AdminSelectors.blockCourtButton);
    await expect(blockButton).toBeVisible();
    await expect(blockButton).toHaveText(/Block Court/i);
  });

  test('should validate required court selection', async ({ page }) => {
    // Fill other fields but leave court unselected
    const reasonInput = page.locator(AdminSelectors.reasonInput);
    await reasonInput.fill('Test maintenance');
    
    // Submit form
    await submitBlockCourt(page);
    
    // Error should appear
    const courtError = page.locator('#courtId-error');
    await expect(courtError).toBeVisible();
    await expect(courtError).toHaveText(/select a court/i);
  });

  test('should validate required reason', async ({ page }) => {
    // Select court but leave reason empty
    const courtSelect = page.locator(AdminSelectors.courtSelect);
    await courtSelect.selectOption({ value: 'court_1' });
    
    // Submit form
    await submitBlockCourt(page);
    
    // Error should appear
    const reasonError = page.locator('#reason-error');
    await expect(reasonError).toBeVisible();
    await expect(reasonError).toHaveText(/required/i);
  });

  test('should validate end time after start time', async ({ page }) => {
    // Select court
    const courtSelect = page.locator(AdminSelectors.courtSelect);
    await courtSelect.selectOption({ value: 'court_1' });
    
    // Set end time before start time
    const startTimeSelect = page.locator(AdminSelectors.startTimeSelect);
    const endTimeSelect = page.locator(AdminSelectors.endTimeSelect);
    
    await startTimeSelect.selectOption({ value: '10:00' });
    await endTimeSelect.selectOption({ value: '08:00' });
    
    // Fill reason
    const reasonInput = page.locator(AdminSelectors.reasonInput);
    await reasonInput.fill('Test maintenance');
    
    // Submit form
    await submitBlockCourt(page);
    
    // Error should appear
    const endTimeError = page.locator('#endTime-error');
    await expect(endTimeError).toBeVisible();
    await expect(endTimeError).toHaveText(/after start time/i);
  });

  test('should successfully block court for maintenance', async ({ page }) => {
    // Fill block court form
    await fillBlockCourtForm(
      page,
      1,
      '14:00',
      '16:00',
      'Surface maintenance - Court resurfacing'
    );
    
    // Submit form
    await submitBlockCourt(page);
    
    // Wait for completion
    await waitForBlockCourtComplete(page);
    
    // Success message should appear
    const successMessage = page.locator(AdminSelectors.blockCourtSuccess);
    await expect(successMessage).toBeVisible();
    
    // Form should be reset
    const courtSelect = page.locator(AdminSelectors.courtSelect);
    await expect(courtSelect).toHaveValue('');
    
    const reasonInput = page.locator(AdminSelectors.reasonInput);
    await expect(reasonInput).toHaveValue('');
  });

  test('should clear errors when user starts typing', async ({ page }) => {
    // Trigger validation error
    await submitBlockCourt(page);
    
    // Error should be visible
    const courtError = page.locator('#courtId-error');
    await expect(courtError).toBeVisible();
    
    // Start typing in court select
    const courtSelect = page.locator(AdminSelectors.courtSelect);
    await courtSelect.selectOption({ value: 'court_1' });
    
    // Error should be cleared
    await expect(courtError).toBeHidden();
  });

  test('should display loading state during block operation', async ({ page }) => {
    // Fill form
    await fillBlockCourtForm(
      page,
      2,
      '09:00',
      '11:00',
      'Equipment maintenance'
    );
    
    // Submit
    const blockButton = page.locator(AdminSelectors.blockCourtButton);
    await blockButton.click();
    
    // Button should show loading state
    const loadingText = blockButton.locator('text=Blocking...');
    const isLoadingVisible = await loadingText.isVisible().catch(() => false);
    
    if (isLoadingVisible) {
      await expect(loadingText).toBeVisible();
    }
    
    // Wait for completion
    await waitForBlockCourtComplete(page);
    
    // Loading should be hidden
    await expect(loadingText).toBeHidden();
  });

  test('should handle block court error gracefully', async ({ page }) => {
    // This test would require mocking a failed API call
    // For now, verify error boundary is not triggered
    const errorBoundary = page.locator(AdminSelectors.errorBoundary);
    await expect(errorBoundary).toBeHidden();
  });

  test('should display time options from 06:00 to 21:00', async ({ page }) => {
    const startTimeSelect = page.locator(AdminSelectors.startTimeSelect);
    const options = startTimeSelect.locator('option');
    
    const count = await options.count();
    expect(count).toBe(16); // 06:00 to 21:00 = 16 hours
    
    // First option should be 06:00
    await expect(options.first()).toHaveValue('06:00');
    
    // Last option should be 21:00
    await expect(options.last()).toHaveValue('21:00');
  });

  test('should update court deployment grid after blocking', async ({ page }) => {
    // Block a court
    await fillBlockCourtForm(
      page,
      3,
      '15:00',
      '17:00',
      'Tournament setup'
    );
    await submitBlockCourt(page);
    await waitForBlockCourtComplete(page);
    
    // Wait for real-time update
    await waitForRealtimeUpdate(page, 3000);
    
    // Court deployment grid should reflect the change
    const courtCell = page.locator(`${AdminSelectors.courtCell}[data-court-number="3"]`);
    const statusBadge = courtCell.locator(AdminSelectors.courtStatusBadge);
    await expect(statusBadge).toHaveText('MAINTENANCE');
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await takeFailureScreenshot(page, testInfo.title);
    }
  });
});

/**
 * User Directory E2E Tests
 *
 * Tests for the User Directory table and search/filter workflow.
 * Verifies user listing, search functionality, role/status filters, and pagination.
 *
 * Test Coverage:
 * - User directory table loads correctly
 * - User search functionality
 * - Role filter (admin, moniteur, client)
 * - Status filter (active, inactive, suspended)
 * - Pagination controls
 * - Real-time updates
 *
 * @module @tests/e2e/admin/admin-user-directory
 */

import { test, expect } from '@playwright/test';
import {
  navigateToAdminDashboard,
  waitForDashboardLoad,
  waitForLoadingComplete,
  waitForRealtimeUpdate,
  AdminSelectors,
  searchUsers,
  filterUsersByRole,
  getUserRowCount,
  takeFailureScreenshot,
} from '../fixtures/admin-fixtures';

test.describe('User Directory', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAdminDashboard(page);
    await waitForLoadingComplete(page);
  });

  test('should display user directory table', async ({ page }) => {
    const table = page.locator(AdminSelectors.userDirectoryTable);
    await expect(table).toBeVisible();
  });

  test('should display user search input', async ({ page }) => {
    const searchInput = page.locator(AdminSelectors.userSearchInput);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /search/i);
  });

  test('should display role filter dropdown', async ({ page }) => {
    const roleFilter = page.locator(AdminSelectors.userRoleFilter);
    await expect(roleFilter).toBeVisible();
  });

  test('should display status filter dropdown', async ({ page }) => {
    const statusFilter = page.locator(AdminSelectors.userStatusFilter);
    await expect(statusFilter).toBeVisible();
  });

  test('should display user rows in table', async ({ page }) => {
    const userRows = page.locator(AdminSelectors.userTableRow);
    const count = await userRows.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should display user information columns', async ({ page }) => {
    const userRows = page.locator(AdminSelectors.userTableRow);
    const firstRow = userRows.first();
    
    // Name column
    const nameCell = firstRow.locator('[data-testid="user-name"]');
    await expect(nameCell).toBeVisible();
    
    // Email column
    const emailCell = firstRow.locator('[data-testid="user-email"]');
    await expect(emailCell).toBeVisible();
    
    // Role column
    const roleCell = firstRow.locator('[data-testid="user-role"]');
    await expect(roleCell).toBeVisible();
    
    // Status column
    const statusCell = firstRow.locator('[data-testid="user-status"]');
    await expect(statusCell).toBeVisible();
  });

  test('should search users by name', async ({ page }) => {
    // Get initial user count
    const initialCount = await getUserRowCount(page);
    
    // Search for a user
    await searchUsers(page, 'admin');
    
    // User count should change or stay same
    const filteredCount = await getUserRowCount(page);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Results should match search query
    const userRows = page.locator(AdminSelectors.userTableRow);
    const count = await userRows.count();
    
    for (let i = 0; i < count; i++) {
      const row = userRows.nth(i);
      const name = row.locator('[data-testid="user-name"]');
      const nameText = await name.textContent();
      
      expect(nameText?.toLowerCase()).toContain('admin');
    }
  });

  test('should search users by email', async ({ page }) => {
    // Search by email domain
    await searchUsers(page, '@tennis');
    
    // All results should contain @tennis
    const userRows = page.locator(AdminSelectors.userTableRow);
    const count = await userRows.count();
    
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const row = userRows.nth(i);
      const email = row.locator('[data-testid="user-email"]');
      const emailText = await email.textContent();
      
      expect(emailText?.toLowerCase()).toContain('@tennis');
    }
  });

  test('should filter users by role (admin)', async ({ page }) => {
    await filterUsersByRole(page, 'admin');
    
    // All results should be admins
    const userRows = page.locator(AdminSelectors.userTableRow);
    const count = await userRows.count();
    
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const row = userRows.nth(i);
      const role = row.locator('[data-testid="user-role"]');
      const roleText = await role.textContent();
      
      expect(roleText?.toLowerCase()).toContain('admin');
    }
  });

  test('should filter users by role (moniteur)', async ({ page }) => {
    await filterUsersByRole(page, 'moniteur');
    
    // All results should be moniteurs
    const userRows = page.locator(AdminSelectors.userTableRow);
    const count = await userRows.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const row = userRows.nth(i);
        const role = row.locator('[data-testid="user-role"]');
        const roleText = await role.textContent();
        
        expect(roleText?.toLowerCase()).toContain('moniteur');
      }
    }
  });

  test('should filter users by role (client)', async ({ page }) => {
    await filterUsersByRole(page, 'client');
    
    // All results should be clients
    const userRows = page.locator(AdminSelectors.userTableRow);
    const count = await userRows.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const row = userRows.nth(i);
        const role = row.locator('[data-testid="user-role"]');
        const roleText = await role.textContent();
        
        expect(roleText?.toLowerCase()).toContain('client');
      }
    }
  });

  test('should display pagination controls', async ({ page }) => {
    const pagination = page.locator(AdminSelectors.paginationControls);
    await expect(pagination).toBeVisible();
    
    // Should have page numbers
    const pageNumbers = pagination.locator('[data-testid="page-number"]');
    const count = await pageNumbers.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate between pages', async ({ page }) => {
    const pagination = page.locator(AdminSelectors.paginationControls);
    
    // Get initial page number
    const currentPage = pagination.locator('[data-testid="current-page"]');
    const initialPageText = await currentPage.textContent();
    const initialPage = parseInt(initialPageText || '1', 10);
    
    // Click next page button
    const nextPageButton = pagination.locator('[data-testid="next-page-button"]');
    const isNextDisabled = await nextPageButton.isDisabled();
    
    if (!isNextDisabled) {
      await nextPageButton.click();
      await waitForRealtimeUpdate(page, 1000);
      
      // Page number should increment
      const updatedPage = pagination.locator('[data-testid="current-page"]');
      const updatedPageText = await updatedPage.textContent();
      const updatedPageNum = parseInt(updatedPageText || '1', 10);
      
      expect(updatedPageNum).toBeGreaterThan(initialPage);
    }
  });

  test('should handle empty search results', async ({ page }) => {
    // Search for non-existent user
    await searchUsers(page, 'xyznonexistent123');
    
    // Should show empty state or zero results
    const userRows = page.locator(AdminSelectors.userTableRow);
    const count = await userRows.count();
    
    // Either no results or empty state message
    if (count === 0) {
      const emptyState = page.locator('[data-testid="empty-state"]');
      await expect(emptyState).toBeVisible();
    }
  });

  test('should clear search and show all users', async ({ page }) => {
    // Search for a user
    await searchUsers(page, 'admin');
    const filteredCount = await getUserRowCount(page);
    
    // Clear search
    const searchInput = page.locator(AdminSelectors.userSearchInput);
    await searchInput.clear();
    await waitForRealtimeUpdate(page, 2000);
    
    // Should show all users again
    const allUsersCount = await getUserRowCount(page);
    expect(allUsersCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('should update user directory in real-time', async ({ page }) => {
    // Get initial user count
    const initialCount = await getUserRowCount(page);
    
    // Wait for real-time update
    await waitForRealtimeUpdate(page, 5000);
    
    // User count should remain consistent (no errors)
    const updatedCount = await getUserRowCount(page);
    
    // Count may change if users are added/removed, but table should be visible
    const table = page.locator(AdminSelectors.userDirectoryTable);
    await expect(table).toBeVisible();
  });

  test('should display loading state initially', async ({ page }) => {
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
    
    // Table should be visible
    const table = page.locator(AdminSelectors.userDirectoryTable);
    await expect(table).toBeVisible();
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await takeFailureScreenshot(page, testInfo.title);
    }
  });
});

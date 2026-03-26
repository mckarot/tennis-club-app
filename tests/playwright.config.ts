/**
 * Playwright Configuration for Tennis Club App E2E Tests
 *
 * Configuration for running end-to-end tests with:
 * - Headless mode
 * - 60s timeout for admin operations
 * - Single worker (sequential tests)
 * - Screenshots on failure
 * - Video on failure
 * - Firebase Emulator integration
 *
 * @module @tests/playwright.config
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './e2e',
  
  // Run tests in files in parallel (false for sequential)
  fullyParallel: false,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests (1 worker for sequential execution)
  workers: 1,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    
    // Video on failure
    video: {
      mode: 'retain-on-failure',
      size: { width: 1920, height: 1080 },
    },
    
    // Browser context options
    viewport: { width: 1920, height: 1080 },
    
    // Action timeout (60s for admin operations)
    actionTimeout: 60000,
    
    // Navigation timeout
    navigationTimeout: 60000,
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'] },
    },
  ],
  
  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // Output directory for test results
  outputDir: 'test-results/',
  
  // Timeout for each test (60s for admin operations)
  timeout: 60000,
  
  // Expect options
  expect: {
    // Timeout for each assertion
    timeout: 10000,
  },
  
  // Global setup file
  // globalSetup: require.resolve('./e2e/global-setup'),
  
  // Global teardown file
  // globalTeardown: require.resolve('./e2e/global-teardown'),
});

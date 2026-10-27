import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration.
 * Story 1.3: config only — no tests yet. Tests covering UJ-1–UJ-5
 * in en+si / light+dark mode are added in Story 9.3.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  // Run all tests in parallel.
  fullyParallel: true,

  // Fail CI on accidental test.only left in source.
  forbidOnly: !!process.env['CI'],

  // Retry once on CI; never locally.
  retries: process.env['CI'] ? 1 : 0,

  // Single worker on CI; auto-detect locally.
  workers: process.env['CI'] ? 1 : undefined,

  reporter: 'html',

  use: {
    // Base URL from env; default to local Vite dev server.
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});

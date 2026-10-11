import { defineConfig, devices } from '@playwright/test'

/**
 * Real Playwright config — replaces the previous __tests__/e2e/*.spec.ts,
 * which were never executed by anything (Jest's testMatch only picks up
 * *.test.ts, and no Playwright config existed) and only contained fake
 * assertions like `expect('/auth/signup').toBeDefined()` that could never
 * fail. These tests are written against real selectors/text read directly
 * from the actual page/component source (admin/login/page.tsx,
 * components/ui/ContactForm.tsx, middleware.ts) — but they have NOT been
 * run in the sandbox that wrote them (no browser, no live DB available
 * there). Run them yourself before trusting them:
 *
 *   npx playwright install --with-deps chromium
 *   npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Only auto-starts a dev server when running locally without an
  // explicit E2E_BASE_URL (e.g. CI pointing at a deployed preview).
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run build && npm start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
})

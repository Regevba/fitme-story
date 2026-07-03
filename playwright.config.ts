import { defineConfig, devices } from '@playwright/test';

// When E2E_BASE_URL is set (e.g. a Vercel preview/production URL, mirroring
// the lighthouse-ci probe idiom), run against that deploy and skip the local
// webServer. Otherwise build + start the app locally on :3000.
const externalBaseURL = process.env.E2E_BASE_URL;
const baseURL = externalBaseURL ?? 'http://localhost:3000';

/**
 * Playwright E2E config (operator decision 2026-06-18 D4 — approve the
 * ~200 MB browser install to unblock the 3D-Universe acceptance tests).
 *
 * Scope today: a green smoke against the live `/framework` page. The
 * universe-scene acceptance specs (AC-10 PR-link, AC-11 pattern overlay,
 * AC-18 mobile 60fps) are scaffolded but skipped — they target
 * `/framework/universe`, which is intentionally 404'd until re-launch (D6,
 * gated on the Rive fallback) and also needs DOM test-hooks on the R3F
 * HoverCard. They activate once the route is live.
 *
 * The webServer builds + starts the real Next app so the smoke runs against
 * production output. Locally an already-running dev server is reused.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Mobile project reserved for the AC-18 60fps spec (activates at re-launch).
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  // Local run builds + starts the app; an external E2E_BASE_URL skips it.
  webServer: externalBaseURL
    ? undefined
    : {
        command: 'npm run build && npm run start',
        url: 'http://localhost:3000',
        timeout: 180_000,
        reuseExistingServer: !process.env.CI,
        // FIT-155 (T7): DASHBOARD_PUBLIC bypasses the /control-room/* proxy
        // auth (src/proxy.ts documented local-dev escape hatch) so the
        // dashboard-route smokes render without operator basic-auth creds.
        env: { DASHBOARD_PUBLIC: 'true' },
      },
});

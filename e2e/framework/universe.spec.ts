import { test, expect } from '@playwright/test';

/**
 * 3D-Universe acceptance specs — SCAFFOLDED, SKIPPED until re-launch.
 *
 * These cover AC-10 (Act IV PR-link hover→click), AC-11 (pattern-overlay
 * hover→tooltip), and AC-18 (mobile 60fps). They are `test.skip`'d for two
 * reasons, both tracked:
 *
 *   1. `/framework/universe` is intentionally 404'd in every environment
 *      until re-launch (operator decision D6 — gated on the Rive fallback).
 *      A 404 can't be acceptance-tested.
 *   2. AC-10/AC-11 assert on DOM hooks (`[data-act="iv"] [data-pr-id]`,
 *      `[data-pattern-id]`) that the R3F HoverCard does not yet emit — the
 *      scene currently passes analytics IDs as props, not DOM attributes.
 *      Adding those test-hooks is part of activating these specs.
 *
 * When the route re-launches: remove the `.skip`, add the HoverCard DOM
 * hooks, and these become the AC-10/AC-11/AC-18 gates the tasks call for.
 */
test.describe('/framework/universe (activates at re-launch)', () => {
  test.skip('AC-10 — Act IV gate-fire signage reveals + links its PR', async ({ page }) => {
    await page.goto('/framework/universe');
    const prHook = page.locator('[data-act="iv"] [data-pr-id]').first();
    await prHook.hover();
    await expect(page.getByText(/#\d+/)).toBeVisible();
    // click → new tab to https://github.com/<owner>/<repo>/pull/<NNN>
  });

  test.skip('AC-11 — Act IV pattern overlay shows the pattern title on hover', async ({ page }) => {
    await page.goto('/framework/universe');
    const patternHook = page.locator('[data-act="iv"] [data-pattern-id]').first();
    await patternHook.hover();
    await expect(page.getByRole('tooltip')).toBeVisible();
  });

  test.skip('AC-18 — mobile 60fps (Pixel 7 project)', async ({ page }) => {
    await page.goto('/framework/universe');
    // WebVitals / frame-timing assertion lands with the route re-launch.
  });
});

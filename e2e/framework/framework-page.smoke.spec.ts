import { test, expect } from '@playwright/test';

/**
 * Live smoke for the `/framework` page — proves the Playwright harness runs
 * end-to-end against the real Next build (operator decision D4). This page is
 * shipped and live (unlike `/framework/universe`, which is 404'd until
 * re-launch — see universe.spec.ts).
 */
test.describe('/framework', () => {
  test('loads with a 200 and the expected hero heading', async ({ page }) => {
    const response = await page.goto('/framework');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/The framework/);
    await expect(page.getByRole('heading', { level: 1, name: 'The framework' })).toBeVisible();
  });

  test('renders the cooperating-floors section', async ({ page }) => {
    await page.goto('/framework');
    await expect(page.getByRole('heading', { name: 'How the floors cooperate' })).toBeVisible();
  });
});

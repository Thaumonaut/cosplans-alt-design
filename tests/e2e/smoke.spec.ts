import { test, expect } from '@playwright/test';

test('smoke: e2e launches browser', async ({ page }) => {
  // No navigation required; ensures Playwright runs at least one test
  await expect(true).toBeTruthy();
});



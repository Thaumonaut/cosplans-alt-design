import { Page, expect } from '@playwright/test';

export async function loginIfNeeded(page: Page) {
  const email = process.env.E2E_EMAIL || process.env.TEST_USER_EMAIL;
  const password = process.env.E2E_PASSWORD || process.env.TEST_USER_PASSWORD;

  // If no creds provided, do nothing
  if (!email || !password) return false;

  // If we're on login, perform UI login
  const url = page.url();
  if (url.includes('/login') || url.endsWith('://localhost:5173/') || url.endsWith('/')) {
    // Navigate to login directly to avoid intermediate redirects
    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await Promise.all([
      page.waitForURL(/\/dashboard|\/?redirectTo=/),
      page.click('button[type="submit"]')
    ]);
    // After login, ensure we landed somewhere valid
    await expect(page).not.toHaveURL(/\/login/);
    return true;
  }

  return false;
}



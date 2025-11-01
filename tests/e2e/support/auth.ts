import { Page, expect } from '@playwright/test';

/**
 * Login if needed for E2E tests
 * 
 * Checks if user is authenticated, and if not, performs login using environment variables.
 * Handles redirects from protected routes to login page.
 */
export async function loginIfNeeded(page: Page): Promise<boolean> {
  const email = process.env.E2E_EMAIL || process.env.TEST_USER_EMAIL;
  const password = process.env.E2E_PASSWORD || process.env.TEST_USER_PASSWORD;

  // If no creds provided, skip login (tests may work without auth)
  if (!email || !password) {
    console.warn('[loginIfNeeded] No E2E credentials provided, skipping login');
    return false;
  }

  // Wait for page to settle and check current URL
  await page.waitForLoadState('networkidle');
  const currentUrl = page.url();

  // Check if we're already authenticated by looking for authenticated indicators
  // If we're not on login and page has loaded, assume we're authenticated
  if (!currentUrl.includes('/login') && currentUrl !== 'about:blank') {
    // Wait a bit to see if we get redirected to login
    try {
      await page.waitForURL(/^(?!.*\/login).*$/, { timeout: 2000 });
      // Not redirected to login, assume authenticated
      return false;
    } catch {
      // Was redirected to login, continue with login flow
    }
  }

  // Navigate to login page if not already there
  if (!currentUrl.includes('/login')) {
    await page.goto('/login', { waitUntil: 'networkidle' });
  }

  // Wait for login form to be ready
  await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#password', { state: 'visible', timeout: 10000 });

  // Fill in credentials
  await page.fill('#email', email);
  await page.fill('#password', password);

  // Submit form and wait for navigation away from login
  await Promise.all([
    page.waitForURL(/^(?!.*\/login).*$/, { timeout: 15000 }).catch(() => {
      throw new Error('Login did not redirect away from login page');
    }),
    page.click('button[type="submit"]')
  ]);

  // Verify we're not on login page anymore
  await expect(page).not.toHaveURL(/\/login/);
  
  // Wait for page to be ready
  await page.waitForLoadState('networkidle');
  
  return true;
}



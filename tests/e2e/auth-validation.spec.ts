import { test, expect } from '@playwright/test';
import { loginIfNeeded } from './support/auth';

/**
 * Simple test to validate that loginIfNeeded() correctly uses credentials from .env.test
 */
test('should successfully authenticate using credentials from .env.test', async ({ page }) => {
  // Go to a protected route (will redirect to login if not authenticated)
  await page.goto('/dashboard', { waitUntil: 'networkidle' });
  
  // loginIfNeeded should detect we need auth and log us in
  const loggedIn = await loginIfNeeded(page);
  
  // Verify login succeeded
  expect(loggedIn).toBe(true);
  
  // Verify we're no longer on login page
  await expect(page).not.toHaveURL(/\/login/);
  
  // Verify we can see authenticated content (main element should be visible)
  await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  
  // Verify we're on dashboard or were redirected appropriately
  const url = page.url();
  expect(url).not.toContain('/login');
  
  console.log(`✅ Authentication successful - currently on: ${url}`);
});


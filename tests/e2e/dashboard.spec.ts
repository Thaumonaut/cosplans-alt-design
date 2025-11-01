import { test, expect } from '@playwright/test';
import { loginIfNeeded } from './support/auth';

test.describe('Dashboard', () => {
  test('should load the dashboard page', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Login if needed (handles redirects to login)
    await loginIfNeeded(page);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/Cosplans/i, { timeout: 10000 });
    
    // Check if main navigation elements are present
    await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });
    
    // Check if dashboard content is loaded
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to different sections', async ({ page }) => {
    await page.goto('/dashboard');
    await loginIfNeeded(page);
    
    // Test navigation to characters page
    await page.click('a[href="/characters"]');
    await expect(page).toHaveURL('/characters');
    
    // Test navigation to projects page (if exists)
    await page.goto('/dashboard');
    // Add more navigation tests as needed
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Login if needed
    await loginIfNeeded(page);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check if mobile navigation works
    await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });
    
    // Check if main content is visible on mobile
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    // Test mobile-specific interactions
    // Add mobile-specific tests
  });
});
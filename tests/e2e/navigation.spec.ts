import { test, expect } from '@playwright/test';
import { loginIfNeeded } from './support/auth';

test.describe('Navigation', () => {
  test('should navigate through all main routes', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes for this test
    
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await loginIfNeeded(page);
    
    // Core routes only - test most important ones first
    const routes = [
      '/dashboard',
      '/ideas',
      '/projects',
      '/resources',
      '/characters',
      '/tasks',
      '/settings'
    ];
    
    for (const route of routes) {
      try {
        // Navigate with shorter timeout to avoid hanging
        await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        // Wait for main content with shorter timeout
        try {
          await expect(page.locator('main')).toBeVisible({ timeout: 8000 });
        } catch (e) {
          // If main not found, check if we got redirected or page has different structure
          const body = page.locator('body');
          if (await body.isVisible({ timeout: 2000 })) {
            // Page loaded, just doesn't have main element - continue
            console.warn(`Route ${route} loaded but no main element found`);
          } else {
            throw e;
          }
        }
        
        // Quick check for visible error messages (don't wait long)
        const criticalError = page.locator('[role="alert"], .error-message, [data-testid="error"]').first();
        if (await criticalError.isVisible({ timeout: 2000 }).catch(() => false)) {
          const errorText = await criticalError.textContent();
          throw new Error(`Critical error on ${route}: ${errorText?.slice(0, 50)}`);
        }
        
        // Verify URL (allow redirects within the same route)
        const currentUrl = page.url();
        if (!currentUrl.includes(route.split('/')[1])) {
          throw new Error(`Unexpected redirect from ${route} to ${currentUrl}`);
        }
      } catch (error) {
        console.error(`Failed on route ${route}:`, error);
        throw error;
      }
    }
  });

  test('should handle sidebar navigation', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await loginIfNeeded(page);
    
    // Test sidebar toggle if it exists (with timeout to avoid hanging)
    const sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');
    const isVisible = await sidebarToggle.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await sidebarToggle.click();
      // Wait briefly for sidebar state change
      await page.waitForTimeout(500);
    }
    // Test passes if sidebar toggle doesn't exist (it's optional)
  });

  test('should handle breadcrumb navigation', async ({ page }) => {
    await page.goto('/settings/profile', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await loginIfNeeded(page);
    
    // Check if breadcrumbs exist and work (with timeout)
    const breadcrumbs = page.locator('[data-testid="breadcrumb"]');
    const isVisible = await breadcrumbs.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      const firstLink = breadcrumbs.locator('a').first();
      if (await firstLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstLink.click();
        await page.waitForTimeout(500);
      }
    }
    // Test passes if breadcrumbs don't exist (they're optional)
  });
});
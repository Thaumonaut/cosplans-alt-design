import { test, expect } from '@playwright/test';
import { loginIfNeeded } from './support/auth';

test.describe('Navigation', () => {
  test('should navigate through all main routes', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await loginIfNeeded(page);
    await page.waitForLoadState('networkidle');
    
    // MVP Core routes only
    const routes = [
      '/dashboard',
      '/ideas',
      '/projects',
      '/resources',
      '/tools',
      '/photoshoots',
      '/characters',
      '/planning',
      '/calendar',
      '/events',
      '/tasks',
      '/timeline',
      '/budget',
      '/settings'
    ];
    
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for page to settle
      await page.waitForLoadState('networkidle');
      
      // Check that the page loads without errors
      await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
      
      // Check that there's no critical error message
      const errorText = page.locator('text=/error/i');
      if (await errorText.count() > 0) {
        const errorCount = await errorText.count();
        // Only fail if there's a visible error (not just text content)
        const visibleErrors = await Promise.all(
          Array.from({ length: errorCount }, (_, i) => 
            errorText.nth(i).isVisible()
          )
        );
        if (visibleErrors.some(Boolean)) {
          throw new Error(`Error message found on ${route}`);
        }
      }
      
      // Check that the URL is correct (allow query params and hash)
      const urlPattern = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:[?#].*)?$';
      await expect(page).toHaveURL(new RegExp(`^${urlPattern}`), { timeout: 5000 });
    }
  });

  test('should handle sidebar navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test sidebar toggle if it exists
    const sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click();
      // Add assertions for sidebar state
    }
  });

  test('should handle breadcrumb navigation', async ({ page }) => {
    await page.goto('/settings/profile');
    
    // Check if breadcrumbs exist and work
    const breadcrumbs = page.locator('[data-testid="breadcrumb"]');
    if (await breadcrumbs.isVisible()) {
      // Test breadcrumb navigation
      await breadcrumbs.locator('a').first().click();
      // Add assertions
    }
  });
});
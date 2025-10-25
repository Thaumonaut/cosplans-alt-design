import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate through all main routes', async ({ page }) => {
    await page.goto('/');
    
    const routes = [
      '/characters',
      '/accessories', 
      '/props',
      '/materials',
      '/equipment',
      '/planning',
      '/calendar',
      '/events',
      '/photoshoots',
      '/tasks',
      '/timeline',
      '/budget',
      '/marketplace',
      '/messages',
      '/profile',
      '/settings'
    ];
    
    for (const route of routes) {
      await page.goto(route);
      
      // Check that the page loads without errors
      await expect(page.locator('main')).toBeVisible();
      
      // Check that there's no error message
      await expect(page.locator('text=Error')).not.toBeVisible();
      
      // Check that the URL is correct
      await expect(page).toHaveURL(route);
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
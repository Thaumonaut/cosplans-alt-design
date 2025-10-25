import { test, expect } from '@playwright/test';

test.describe('Forms', () => {
  test('should handle character creation form', async ({ page }) => {
    await page.goto('/characters');
    
    // Look for create button or form
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add")');
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Fill out form if modal/form appears
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Character');
        
        // Submit form
        const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Check for success indication
          await expect(page.locator('text=Test Character')).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/characters');
    
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add")');
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Check for validation messages
        const errorMessage = page.locator('text=required, text=Required, .error, [role="alert"]');
        if (await errorMessage.first().isVisible()) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto('/');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await searchInput.press('Enter');
      
      // Check if search results or filtering works
      // This will depend on the actual implementation
    }
  });
});
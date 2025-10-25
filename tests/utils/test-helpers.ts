import { Page, expect } from '@playwright/test';

/**
 * Test utilities for common operations
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.locator('main')).toBeVisible();
  }

  /**
   * Navigate to a route and wait for it to load
   */
  async navigateAndWait(route: string) {
    await this.page.goto(route);
    await this.waitForPageLoad();
  }

  /**
   * Check if an element exists without throwing
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fill a form field by label or placeholder
   */
  async fillField(labelOrPlaceholder: string, value: string) {
    const input = this.page.locator(`input[placeholder*="${labelOrPlaceholder}" i], input[aria-label*="${labelOrPlaceholder}" i]`);
    await input.fill(value);
  }

  /**
   * Click a button by text content
   */
  async clickButton(text: string) {
    const button = this.page.locator(`button:has-text("${text}"), input[type="submit"][value="${text}"]`);
    await button.click();
  }

  /**
   * Check for error messages
   */
  async hasErrorMessage(): Promise<boolean> {
    const errorSelectors = [
      '.error',
      '[role="alert"]',
      '.text-red-500',
      '.text-destructive',
      'text=Error',
      'text=required',
      'text=Required'
    ];

    for (const selector of errorSelectors) {
      if (await this.elementExists(selector)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check for success messages
   */
  async hasSuccessMessage(): Promise<boolean> {
    const successSelectors = [
      '.success',
      '.text-green-500',
      '.text-success',
      'text=Success',
      'text=Created',
      'text=Saved'
    ];

    for (const selector of successSelectors) {
      if (await this.elementExists(selector)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async screenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Mock API responses for testing
   */
  async mockApiResponse(url: string, response: any) {
    await this.page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }
}
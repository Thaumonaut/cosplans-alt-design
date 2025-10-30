/**
 * E2E Test Helper Functions
 * 
 * Shared utilities for Playwright E2E tests.
 * Provides retry logic, waiting strategies, and common interactions.
 * 
 * Usage:
 * ```typescript
 * import { fillInput, clickButton, waitForApiCall } from './support/helpers';
 * 
 * await fillInput(page.locator('#email'), 'test@example.com');
 * await clickButton(page.locator('button[type="submit"]'));
 * ```
 */

import type { Page, Locator } from '@playwright/test';

/**
 * Fill a text input with retry logic
 * 
 * Waits for element, clears existing value, types new value, verifies.
 * 
 * @param locator - Input element locator
 * @param value - Value to type
 * @param options - Fill options
 * 
 * @example
 * ```typescript
 * await fillInput(page.locator('#email'), 'test@example.com');
 * ```
 */
export async function fillInput(
  locator: Locator,
  value: string,
  options: {
    /** Clear field before filling (default: true) */
    clear?: boolean;
    /** Delay between keystrokes in ms (default: 0) */
    delay?: number;
  } = {}
): Promise<void> {
  const { clear = true, delay = 0 } = options;

  await locator.waitFor({ state: 'visible' });

  if (clear) {
    await locator.clear();
  }

  await locator.fill(value, { delay });

  // Verify value was filled
  const actualValue = await locator.inputValue();
  if (actualValue !== value) {
    throw new Error(`Failed to fill input. Expected: "${value}", Got: "${actualValue}"`);
  }
}

/**
 * Click a button with retry logic
 * 
 * Waits for element to be visible and enabled before clicking.
 * 
 * @param locator - Button element locator
 * @param options - Click options
 * 
 * @example
 * ```typescript
 * await clickButton(page.locator('button[type="submit"]'));
 * ```
 */
export async function clickButton(
  locator: Locator,
  options: {
    /** Force click even if element is hidden (default: false) */
    force?: boolean;
    /** Wait for navigation after click (default: false) */
    waitForNavigation?: boolean;
  } = {}
): Promise<void> {
  const { force = false, waitForNavigation = false } = options;

  await locator.waitFor({ state: 'visible' });

  if (!force) {
    // Ensure button is enabled
    const isDisabled = await locator.isDisabled();
    if (isDisabled) {
      throw new Error('Cannot click disabled button');
    }
  }

  if (waitForNavigation) {
    await Promise.all([
      locator.click({ force }),
      locator.page().waitForNavigation(),
    ]);
  } else {
    await locator.click({ force });
  }
}

/**
 * Select an option from a dropdown
 * 
 * @param locator - Select element locator
 * @param value - Value or label to select
 * @param options - Select options
 * 
 * @example
 * ```typescript
 * await selectOption(page.locator('#status'), 'in-progress');
 * await selectOption(page.locator('#priority'), { label: 'High Priority' });
 * ```
 */
export async function selectOption(
  locator: Locator,
  value: string | { label: string } | { value: string } | { index: number },
  options: {
    /** Wait for element to be visible (default: true) */
    wait?: boolean;
  } = {}
): Promise<void> {
  const { wait = true } = options;

  if (wait) {
    await locator.waitFor({ state: 'visible' });
  }

  if (typeof value === 'string') {
    await locator.selectOption(value);
  } else if ('label' in value) {
    await locator.selectOption({ label: value.label });
  } else if ('value' in value) {
    await locator.selectOption({ value: value.value });
  } else if ('index' in value) {
    await locator.selectOption({ index: value.index });
  }
}

/**
 * Wait for navigation to complete
 * 
 * Executes an action and waits for navigation to finish.
 * 
 * @param page - Playwright page
 * @param action - Action that triggers navigation
 * 
 * @example
 * ```typescript
 * await waitForNavigation(page, async () => {
 *   await page.click('a[href="/dashboard"]');
 * });
 * ```
 */
export async function waitForNavigation(
  page: Page,
  action: () => Promise<void>
): Promise<void> {
  await Promise.all([
    page.waitForNavigation(),
    action(),
  ]);
}

/**
 * Wait for API call to complete
 * 
 * Waits for a network request matching the URL pattern.
 * 
 * @param page - Playwright page
 * @param urlPattern - URL pattern to match (string or regex)
 * @param options - Wait options
 * @returns Response data
 * 
 * @example
 * ```typescript
 * // Wait for projects API call
 * const response = await waitForApiCall(page, '/api/projects');
 * console.log('Projects loaded:', response.status());
 * ```
 */
export async function waitForApiCall(
  page: Page,
  urlPattern: string | RegExp,
  options: {
    /** Timeout in ms (default: 10000) */
    timeout?: number;
  } = {}
): Promise<any> {
  const { timeout = 10000 } = options;

  const response = await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      } else {
        return urlPattern.test(url);
      }
    },
    { timeout }
  );

  return response;
}

/**
 * Wait for element to be visible and stable
 * 
 * Waits for element to appear and stop moving (useful for animations).
 * 
 * @param locator - Element locator
 * @param options - Wait options
 * 
 * @example
 * ```typescript
 * await waitForStable(page.locator('.modal'));
 * ```
 */
export async function waitForStable(
  locator: Locator,
  options: {
    /** Timeout in ms (default: 5000) */
    timeout?: number;
  } = {}
): Promise<void> {
  const { timeout = 5000 } = options;

  await locator.waitFor({ state: 'visible', timeout });
  
  // Wait for element to stop moving
  let previousBox = await locator.boundingBox();
  await locator.page().waitForTimeout(100);
  let currentBox = await locator.boundingBox();

  const startTime = Date.now();
  while (
    previousBox?.x !== currentBox?.x ||
    previousBox?.y !== currentBox?.y
  ) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Element did not stabilize within timeout');
    }

    previousBox = currentBox;
    await locator.page().waitForTimeout(100);
    currentBox = await locator.boundingBox();
  }
}

/**
 * Scroll element into view
 * 
 * @param locator - Element locator
 * 
 * @example
 * ```typescript
 * await scrollIntoView(page.locator('#bottom-section'));
 * ```
 */
export async function scrollIntoView(locator: Locator): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
}

/**
 * Take a screenshot with automatic naming
 * 
 * @param page - Playwright page
 * @param name - Screenshot name
 * @param options - Screenshot options
 * 
 * @example
 * ```typescript
 * await screenshot(page, 'login-success');
 * ```
 */
export async function screenshot(
  page: Page,
  name: string,
  options: {
    /** Full page screenshot (default: false) */
    fullPage?: boolean;
  } = {}
): Promise<void> {
  const { fullPage = false } = options;

  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage,
  });
}

/**
 * Wait for loading spinner to disappear
 * 
 * @param page - Playwright page
 * @param options - Wait options
 * 
 * @example
 * ```typescript
 * await waitForLoadingToFinish(page);
 * ```
 */
export async function waitForLoadingToFinish(
  page: Page,
  options: {
    /** Selector for loading indicator (default: '[data-testid="loading"]') */
    selector?: string;
    /** Timeout in ms (default: 10000) */
    timeout?: number;
  } = {}
): Promise<void> {
  const { selector = '[data-testid="loading"]', timeout = 10000 } = options;

  try {
    await page.locator(selector).waitFor({ state: 'hidden', timeout });
  } catch {
    // Loading indicator might not exist or already hidden - this is fine
  }
}

/**
 * Get text content from element
 * 
 * @param locator - Element locator
 * @returns Trimmed text content
 * 
 * @example
 * ```typescript
 * const title = await getText(page.locator('h1'));
 * expect(title).toBe('Welcome');
 * ```
 */
export async function getText(locator: Locator): Promise<string> {
  await locator.waitFor({ state: 'visible' });
  const text = await locator.textContent();
  return text?.trim() || '';
}

/**
 * Check if element exists (without waiting)
 * 
 * @param locator - Element locator
 * @returns true if element exists in DOM
 * 
 * @example
 * ```typescript
 * const hasError = await exists(page.locator('.error-message'));
 * ```
 */
export async function exists(locator: Locator): Promise<boolean> {
  try {
    await locator.waitFor({ state: 'attached', timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if element is visible
 * 
 * @param locator - Element locator
 * @returns true if element is visible
 * 
 * @example
 * ```typescript
 * const isVisible = await isVisible(page.locator('.modal'));
 * ```
 */
export async function isVisible(locator: Locator): Promise<boolean> {
  try {
    await locator.waitFor({ state: 'visible', timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Upload a file to file input
 * 
 * @param locator - File input locator
 * @param filePath - Path to file
 * 
 * @example
 * ```typescript
 * await uploadFile(page.locator('input[type="file"]'), 'path/to/image.jpg');
 * ```
 */
export async function uploadFile(locator: Locator, filePath: string): Promise<void> {
  await locator.setInputFiles(filePath);
}


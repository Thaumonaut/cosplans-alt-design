/**
 * Login Page Object Model
 * 
 * Encapsulates interactions with the login page.
 * Provides methods for authentication flows.
 * 
 * Usage:
 * ```typescript
 * import { LoginPage } from './support/page-objects/LoginPage';
 * 
 * const loginPage = new LoginPage(page);
 * await loginPage.goto();
 * await loginPage.login('user@test.com', 'password');
 * ```
 */

import type { Page, Locator } from '@playwright/test';
import { fillInput, clickButton, waitForNavigation } from '../helpers';

export class LoginPage {
  readonly page: Page;

  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly signupLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly githubButton: Locator;
  readonly googleButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Form inputs
    this.emailInput = page.locator('input[type="email"]', { hasText: /email/i }).or(
      page.locator('#email')
    );
    this.passwordInput = page.locator('input[type="password"]').or(
      page.locator('#password')
    );

    // Buttons
    this.loginButton = page.locator('button[type="submit"]', { hasText: /log in|sign in/i });
    this.githubButton = page.locator('button', { hasText: /github/i });
    this.googleButton = page.locator('button', { hasText: /google/i });

    // Links
    this.signupLink = page.locator('a', { hasText: /sign up|create account/i });
    this.forgotPasswordLink = page.locator('a', { hasText: /forgot password|reset password/i });

    // Error messages
    this.errorMessage = page.locator('[role="alert"]').or(
      page.locator('.error-message')
    ).or(
      page.locator('[data-testid="error-message"]')
    );
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.waitForLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForLoad(): Promise<void> {
    await this.emailInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.loginButton.waitFor({ state: 'visible' });
  }

  /**
   * Verify we're on the login page
   */
  async isOnPage(): Promise<boolean> {
    try {
      await this.emailInput.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Login with email and password
   * 
   * @param email - User email
   * @param password - User password
   * 
   * @example
   * ```typescript
   * await loginPage.login('alice@test.com', 'AliceTest123!');
   * ```
   */
  async login(email: string, password: string): Promise<void> {
    await fillInput(this.emailInput, email);
    await fillInput(this.passwordInput, password);
    
    await waitForNavigation(this.page, async () => {
      await clickButton(this.loginButton);
    });
  }

  /**
   * Login with GitHub OAuth
   * 
   * Note: Requires OAuth popup handling in test setup.
   * 
   * @example
   * ```typescript
   * await loginPage.loginWithGithub();
   * ```
   */
  async loginWithGithub(): Promise<void> {
    await clickButton(this.githubButton, { waitForNavigation: true });
  }

  /**
   * Login with Google OAuth
   * 
   * Note: Requires OAuth popup handling in test setup.
   * 
   * @example
   * ```typescript
   * await loginPage.loginWithGoogle();
   * ```
   */
  async loginWithGoogle(): Promise<void> {
    await clickButton(this.googleButton, { waitForNavigation: true });
  }

  /**
   * Click sign up link
   * 
   * @example
   * ```typescript
   * await loginPage.clickSignup();
   * ```
   */
  async clickSignup(): Promise<void> {
    await waitForNavigation(this.page, async () => {
      await clickButton(this.signupLink);
    });
  }

  /**
   * Click forgot password link
   * 
   * @example
   * ```typescript
   * await loginPage.clickForgotPassword();
   * ```
   */
  async clickForgotPassword(): Promise<void> {
    await waitForNavigation(this.page, async () => {
      await clickButton(this.forgotPasswordLink);
    });
  }

  /**
   * Get error message text
   * 
   * @returns Error message text or empty string if no error
   * 
   * @example
   * ```typescript
   * const error = await loginPage.getErrorMessage();
   * expect(error).toContain('Invalid credentials');
   * ```
   */
  async getErrorMessage(): Promise<string> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 2000 });
      return (await this.errorMessage.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  /**
   * Check if login was successful (redirected away from login page)
   * 
   * @returns true if redirected to dashboard or other authenticated page
   * 
   * @example
   * ```typescript
   * await loginPage.login('alice@test.com', 'AliceTest123!');
   * const success = await loginPage.isLoginSuccessful();
   * expect(success).toBe(true);
   * ```
   */
  async isLoginSuccessful(): Promise<boolean> {
    // Wait a moment for redirect
    await this.page.waitForTimeout(500);

    const currentUrl = this.page.url();
    return !currentUrl.includes('/login');
  }

  /**
   * Check if error message is visible
   */
  async hasError(): Promise<boolean> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fill email only (for partial form testing)
   */
  async fillEmail(email: string): Promise<void> {
    await fillInput(this.emailInput, email);
  }

  /**
   * Fill password only (for partial form testing)
   */
  async fillPassword(password: string): Promise<void> {
    await fillInput(this.passwordInput, password);
  }

  /**
   * Submit form without filling (for validation testing)
   */
  async submitEmptyForm(): Promise<void> {
    await clickButton(this.loginButton);
  }
}


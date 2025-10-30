/**
 * Dashboard Page Object Model
 * 
 * Encapsulates interactions with the main dashboard page.
 * 
 * Usage:
 * ```typescript
 * const dashboardPage = new DashboardPage(page);
 * await dashboardPage.goto();
 * await dashboardPage.clickCreateProject();
 * ```
 */

import type { Page, Locator } from '@playwright/test';
import { clickButton, fillInput, waitForNavigation, getText } from '../helpers';

export class DashboardPage {
  readonly page: Page;

  // Locators
  readonly createProjectButton: Locator;
  readonly projectList: Locator;
  readonly statsWidgets: Locator;
  readonly welcomeMessage: Locator;
  readonly sidebar: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.createProjectButton = page.locator('button', { hasText: /create project|new project/i });
    this.projectList = page.locator('[data-testid="project-list"]').or(page.locator('.project-list'));
    this.statsWidgets = page.locator('[data-testid="stats-widgets"]').or(page.locator('.stats-widgets'));
    this.welcomeMessage = page.locator('h1').or(page.locator('[data-testid="welcome-message"]'));
    this.sidebar = page.locator('[data-testid="sidebar"]').or(page.locator('aside'));
    this.searchInput = page.locator('input[type="search"]').or(page.locator('[placeholder*="Search"]'));
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async isOnPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('/dashboard');
  }

  async clickCreateProject(): Promise<void> {
    await clickButton(this.createProjectButton);
    await this.page.waitForTimeout(500); // Wait for modal/form to appear
  }

  async navigateToSection(section: string): Promise<void> {
    const link = this.sidebar.locator('a', { hasText: new RegExp(section, 'i') });
    await waitForNavigation(this.page, async () => {
      await clickButton(link);
    });
  }

  async searchProjects(query: string): Promise<void> {
    await fillInput(this.searchInput, query);
    await this.page.waitForTimeout(500); // Debounce
  }

  async getProjectCount(): Promise<number> {
    const projects = await this.projectList.locator('[data-testid="project-card"]').or(
      this.projectList.locator('.project-card')
    ).count();
    return projects;
  }

  async isProjectVisible(projectTitle: string): Promise<boolean> {
    const project = this.projectList.locator('text=' + projectTitle);
    try {
      await project.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async getWelcomeMessage(): Promise<string> {
    return await getText(this.welcomeMessage);
  }
}


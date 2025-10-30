/**
 * Project Page Object Model
 */

import type { Page, Locator } from '@playwright/test';
import { clickButton, fillInput, selectOption, getText } from '../helpers';

export class ProjectPage {
  readonly page: Page;
  readonly projectTitle: Locator;
  readonly projectStatus: Locator;
  readonly budgetDisplay: Locator;
  readonly progressBar: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly archiveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.projectTitle = page.locator('h1').or(page.locator('[data-testid="project-title"]'));
    this.projectStatus = page.locator('[data-testid="project-status"]');
    this.budgetDisplay = page.locator('[data-testid="budget-display"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.editButton = page.locator('button', { hasText: /edit/i });
    this.deleteButton = page.locator('button', { hasText: /delete/i });
    this.archiveButton = page.locator('button', { hasText: /archive/i });
  }

  async goto(projectId: number): Promise<void> {
    await this.page.goto(`/projects/${projectId}`);
  }

  async waitForLoad(): Promise<void> {
    await this.projectTitle.waitFor({ state: 'visible' });
  }

  async isOnPage(): Promise<boolean> {
    return this.page.url().includes('/projects/');
  }

  async getProjectTitle(): Promise<string> {
    return await getText(this.projectTitle);
  }

  async editProject(updates: { title?: string; status?: string }): Promise<void> {
    await clickButton(this.editButton);

    if (updates.title) {
      await fillInput(this.page.locator('#title'), updates.title);
    }
    if (updates.status) {
      await selectOption(this.page.locator('#status'), updates.status);
    }

    await clickButton(this.page.locator('button[type="submit"]'));
  }

  async deleteProject(): Promise<void> {
    await clickButton(this.deleteButton);
    await clickButton(this.page.locator('button', { hasText: /confirm|yes/i }));
  }

  async archiveProject(): Promise<void> {
    await clickButton(this.archiveButton);
  }

  async updateStatus(status: string): Promise<void> {
    const statusSelect = this.page.locator('#status');
    await selectOption(statusSelect, status);
  }

  async getProjectStatus(): Promise<string> {
    return await getText(this.projectStatus);
  }

  async getBudgetSpent(): Promise<number> {
    const text = await getText(this.budgetDisplay);
    const match = text.match(/\$?(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getProgress(): Promise<number> {
    const text = await this.progressBar.getAttribute('aria-valuenow');
    return parseInt(text || '0', 10);
  }
}


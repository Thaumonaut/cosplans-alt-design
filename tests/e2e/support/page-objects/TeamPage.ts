/**
 * Team Page Object Model
 */

import type { Page, Locator } from '@playwright/test';
import { clickButton, fillInput } from '../helpers';

export class TeamPage {
  readonly page: Page;
  readonly teamList: Locator;
  readonly createTeamButton: Locator;
  readonly personalTeam: Locator;

  constructor(page: Page) {
    this.page = page;
    this.teamList = page.locator('[data-testid="team-list"]');
    this.createTeamButton = page.locator('button', { hasText: /create team|new team/i });
    this.personalTeam = page.locator('text=/personal/i');
  }

  async goto(): Promise<void> {
    await this.page.goto('/teams');
  }

  async createTeam(name: string, description?: string): Promise<void> {
    await clickButton(this.createTeamButton);
    await fillInput(this.page.locator('#name'), name);
    if (description) {
      await fillInput(this.page.locator('#description'), description);
    }
    await clickButton(this.page.locator('button[type="submit"]'));
  }

  async selectTeam(teamName: string): Promise<void> {
    await clickButton(this.teamList.locator(`text=${teamName}`));
  }

  async inviteMember(email: string, role: 'admin' | 'member' | 'viewer'): Promise<void> {
    await clickButton(this.page.locator('button', { hasText: /invite/i }));
    await fillInput(this.page.locator('#email'), email);
    await fillInput(this.page.locator('#role'), role);
    await clickButton(this.page.locator('button[type="submit"]'));
  }

  async removeMember(email: string): Promise<void> {
    const member = this.page.locator(`text=${email}`);
    const removeBtn = member.locator('..').locator('button', { hasText: /remove/i });
    await clickButton(removeBtn);
  }

  async getTeamCount(): Promise<number> {
    return await this.teamList.locator('[data-testid="team-item"]').count();
  }

  async isTeamVisible(teamName: string): Promise<boolean> {
    try {
      await this.teamList.locator(`text=${teamName}`).waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async getMemberCount(teamName: string): Promise<number> {
    await this.selectTeam(teamName);
    return await this.page.locator('[data-testid="member-item"]').count();
  }
}


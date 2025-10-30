/**
 * Task Page Object Model
 */

import type { Page, Locator } from '@playwright/test';
import { clickButton, fillInput, selectOption } from '../helpers';

export class TaskPage {
  readonly page: Page;
  readonly taskList: Locator;
  readonly createTaskButton: Locator;
  readonly filterButtons: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.taskList = page.locator('[data-testid="task-list"]');
    this.createTaskButton = page.locator('button', { hasText: /create task|new task/i });
    this.filterButtons = page.locator('[data-testid="filter-buttons"]');
    this.sortDropdown = page.locator('#sort');
  }

  async goto(): Promise<void> {
    await this.page.goto('/tasks');
  }

  async createTask(task: { title: string; priority?: string }): Promise<void> {
    await clickButton(this.createTaskButton);
    await fillInput(this.page.locator('#title'), task.title);
    if (task.priority) {
      await selectOption(this.page.locator('#priority'), task.priority);
    }
    await clickButton(this.page.locator('button[type="submit"]'));
  }

  async filterTasks(filter: 'all' | 'completed' | 'pending' | 'overdue'): Promise<void> {
    await clickButton(this.filterButtons.locator(`button`, { hasText: new RegExp(filter, 'i') }));
  }

  async sortTasks(sortBy: 'priority' | 'dueDate' | 'title'): Promise<void> {
    await selectOption(this.sortDropdown, sortBy);
  }

  async completeTask(taskTitle: string): Promise<void> {
    const task = this.taskList.locator(`text=${taskTitle}`);
    const checkbox = task.locator('..').locator('input[type="checkbox"]');
    await checkbox.check();
  }

  async deleteTask(taskTitle: string): Promise<void> {
    const task = this.taskList.locator(`text=${taskTitle}`);
    const deleteBtn = task.locator('..').locator('button', { hasText: /delete/i });
    await clickButton(deleteBtn);
  }

  async getTaskCount(): Promise<number> {
    return await this.taskList.locator('[data-testid="task-item"]').count();
  }

  async isTaskVisible(taskTitle: string): Promise<boolean> {
    try {
      await this.taskList.locator(`text=${taskTitle}`).waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async isTaskCompleted(taskTitle: string): Promise<boolean> {
    const task = this.taskList.locator(`text=${taskTitle}`);
    const checkbox = task.locator('..').locator('input[type="checkbox"]');
    return await checkbox.isChecked();
  }
}


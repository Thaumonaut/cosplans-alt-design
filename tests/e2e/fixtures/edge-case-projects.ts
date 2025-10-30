/**
 * Edge Case Fixtures for E2E Testing
 * 
 * Static test data for boundary testing and edge cases.
 * Use these for testing form validation, error handling, and extreme scenarios.
 * 
 * Usage:
 * ```typescript
 * import { EDGE_CASE_PROJECTS } from '../fixtures/edge-case-projects';
 * 
 * test('handles project with no budget', async ({ page }) => {
 *   await createProject(page, EDGE_CASE_PROJECTS.noBudget);
 *   // ... test assertions
 * });
 * ```
 */

import type { TestProject } from '../../utils/factory';

/**
 * Edge case project fixtures for boundary testing
 */
export const EDGE_CASE_PROJECTS = {
  /**
   * Project with no budget (zero spent, zero total)
   */
  noBudget: {
    title: 'Free Project - No Budget',
    character: 'Budget-Free Character',
    series: 'Test Series',
    image: null,
    progress: 0,
    budget: {
      spent: 0,
      total: 0,
    },
    deadline: null,
    status: 'in-progress' as const,
  },

  /**
   * Project with overdue deadline (past date)
   */
  overdue: {
    title: 'Overdue Project',
    character: 'Late Character',
    series: 'Test Series',
    image: null,
    progress: 50,
    budget: {
      spent: 250,
      total: 500,
    },
    deadline: '2020-01-01T00:00:00Z', // Past date
    status: 'in-progress' as const,
  },

  /**
   * Project with very long title (boundary testing - 500 chars)
   */
  longTitle: {
    title: 'A'.repeat(500), // 500 character title
    character: 'Long Title Character',
    series: 'Test Series',
    image: null,
    progress: 0,
    budget: {
      spent: 0,
      total: 1000,
    },
    deadline: null,
    status: 'idea' as const,
  },

  /**
   * Project with special characters and emojis
   */
  specialChars: {
    title: 'Project with émojis 🎭🎨 and spëcial çhars',
    character: 'Special™ Character®',
    series: 'Test™ Series® 日本語',
    image: null,
    progress: 25,
    budget: {
      spent: 100,
      total: 400,
    },
    deadline: null,
    status: 'planning' as const,
  },

  /**
   * Project with extremely high budget
   */
  highBudget: {
    title: 'Million Dollar Cosplay',
    character: 'Expensive Character',
    series: 'High Budget Series',
    image: null,
    progress: 10,
    budget: {
      spent: 100000,
      total: 1000000,
    },
    deadline: null,
    status: 'planning' as const,
  },

  /**
   * Project with over-budget spending (spent > total)
   */
  overBudget: {
    title: 'Over-Budget Project',
    character: 'Expensive Mistakes',
    series: 'Budget Overrun Series',
    image: null,
    progress: 75,
    budget: {
      spent: 1500,
      total: 1000,
    },
    deadline: null,
    status: 'in-progress' as const,
  },

  /**
   * Project with deadline very far in the future
   */
  farFuture: {
    title: 'Future Project',
    character: 'Future Character',
    series: 'Futuristic Series',
    image: null,
    progress: 0,
    budget: {
      spent: 0,
      total: 500,
    },
    deadline: '2099-12-31T23:59:59Z', // Far future
    status: 'idea' as const,
  },

  /**
   * Completed project with 100% progress
   */
  completed: {
    title: 'Completed Project',
    character: 'Finished Character',
    series: 'Completed Series',
    image: null,
    progress: 100,
    budget: {
      spent: 500,
      total: 500,
    },
    deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    status: 'completed' as const,
  },

  /**
   * Archived project
   */
  archived: {
    title: 'Archived Project',
    character: 'Archived Character',
    series: 'Archived Series',
    image: null,
    progress: 100,
    budget: {
      spent: 750,
      total: 1000,
    },
    deadline: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
    status: 'archived' as const,
  },

  /**
   * Project with minimum viable data (only required fields)
   */
  minimal: {
    title: 'Minimal Project',
    character: 'Min Character',
    series: 'Min Series',
    image: null,
    progress: 0,
    budget: {
      spent: 0,
      total: 0,
    },
    deadline: null,
    status: 'idea' as const,
  },

  /**
   * Project with HTML in title (XSS prevention testing)
   */
  htmlInjection: {
    title: '<script>alert("XSS")</script>',
    character: '<img src=x onerror=alert(1)>',
    series: '<b>Bold Series</b>',
    image: null,
    progress: 0,
    budget: {
      spent: 0,
      total: 100,
    },
    deadline: null,
    status: 'idea' as const,
  },

  /**
   * Project with SQL injection attempt (SQL injection prevention testing)
   */
  sqlInjection: {
    title: "'; DROP TABLE projects; --",
    character: "1' OR '1'='1",
    series: "admin'--",
    image: null,
    progress: 0,
    budget: {
      spent: 0,
      total: 100,
    },
    deadline: null,
    status: 'idea' as const,
  },
} as const;

/**
 * Array of all edge case projects for batch testing
 */
export const ALL_EDGE_CASES = Object.values(EDGE_CASE_PROJECTS);

/**
 * Edge case tasks for testing task management
 */
export const EDGE_CASE_TASKS = {
  /**
   * Task with no due date
   */
  noDueDate: {
    title: 'Task without due date',
    description: 'This task has no deadline',
    completed: false,
    projectId: 1,
    dueDate: null,
    priority: 'low' as const,
  },

  /**
   * Task with very long title
   */
  longTitle: {
    title: 'L'.repeat(500), // 500 chars
    description: 'Long title task',
    completed: false,
    projectId: 1,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: 'medium' as const,
  },

  /**
   * Overdue high-priority task
   */
  overdueHighPriority: {
    title: 'Overdue Critical Task',
    description: 'This task is overdue and high priority',
    completed: false,
    projectId: 1,
    dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    priority: 'high' as const,
  },

  /**
   * Completed task
   */
  completed: {
    title: 'Completed Task',
    description: 'This task is already done',
    completed: true,
    projectId: 1,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: 'medium' as const,
  },
} as const;

/**
 * Edge case events for testing event management
 */
export const EDGE_CASE_EVENTS = {
  /**
   * Event in the past
   */
  pastEvent: {
    title: 'Past Convention',
    description: 'This event already happened',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    type: 'convention' as const,
    projectId: null,
  },

  /**
   * Event very far in future
   */
  farFuture: {
    title: 'Future Convention 2099',
    description: 'Event very far in the future',
    date: new Date('2099-12-31'),
    type: 'convention' as const,
    projectId: null,
  },

  /**
   * Event with special characters
   */
  specialChars: {
    title: 'Event™ with émojis 🎉🎭',
    description: 'Spëcial characters in description',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    type: 'other' as const,
    projectId: null,
  },
} as const;

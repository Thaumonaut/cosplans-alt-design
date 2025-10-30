/**
 * Test Data Factories
 * 
 * Factories generate realistic test data using Faker.js with sensible defaults.
 * All factories support partial overrides for customization.
 * 
 * Usage:
 * ```typescript
 * // Generate with defaults
 * const user = createTestUser();
 * 
 * // Override specific fields
 * const admin = createTestUser({ role: 'admin', email: 'admin@test.com' });
 * 
 * // Batch creation
 * const users = createTestUsers(10);
 * ```
 */

import { faker } from '@faker-js/faker';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Test user with optional password for E2E authentication tests
 */
export interface TestUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  password?: string; // Not stored in DB, used for E2E login
}

export interface TestTeam {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TestTeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
  updated_at: string;
}

export interface TestProject {
  id: number;
  title: string;
  character: string;
  series: string;
  image: string | null;
  progress: number;
  budget: {
    spent: number;
    total: number;
  };
  deadline: string | null;
  status: 'idea' | 'planning' | 'in-progress' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface TestTask {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  projectId: number;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high';
}

export interface TestEvent {
  id: number;
  title: string;
  description: string | null;
  date: Date;
  type: 'convention' | 'photoshoot' | 'deadline' | 'other';
  projectId: number | null;
}

export interface TestCharacter {
  id: string;
  name: string;
  series: string;
  source_medium: 'anime' | 'manga' | 'game' | 'movie' | 'tv' | 'book' | 'original';
  team_id: string;
  reference_images: string[];
  budget_mode: 'personal' | 'commission';
  budget_limit: number | null;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// User Factories
// ============================================================================

/**
 * Create a test user with realistic data
 * 
 * @param overrides - Partial user object to override defaults
 * @returns Complete test user object
 * 
 * @example
 * ```typescript
 * const user = createTestUser({ email: 'custom@test.com' });
 * ```
 */
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id: faker.string.uuid(),
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    first_name: firstName,
    last_name: lastName,
    avatar_url: faker.image.avatar(),
    created_at: faker.date.past({ years: 1 }).toISOString(),
    updated_at: faker.date.recent({ days: 30 }).toISOString(),
    password: 'Test123!@#', // Default test password
    ...overrides,
  };
}

/**
 * Create user insert object (without ID for database insertion)
 */
export function createTestUserInsert(overrides: Partial<Omit<TestUser, 'id'>> = {}) {
  const user = createTestUser(overrides);
  const { id, password, ...insertData } = user;
  return insertData;
}

/**
 * Predefined test users for consistent E2E tests
 * 
 * These users have fixed emails/passwords for E2E authentication tests.
 * Use these instead of random users for reproducible E2E tests.
 */
export const FIXED_TEST_USERS = {
  alice: createTestUser({
    id: '00000000-0000-0000-0000-000000000001',
    email: 'alice@test.com',
    first_name: 'Alice',
    last_name: 'Cosplayer',
    password: 'AliceTest123!',
  }),
  bob: createTestUser({
    id: '00000000-0000-0000-0000-000000000002',
    email: 'bob@test.com',
    first_name: 'Bob',
    last_name: 'Photographer',
    password: 'BobTest123!',
  }),
  charlie: createTestUser({
    id: '00000000-0000-0000-0000-000000000003',
    email: 'charlie@test.com',
    first_name: 'Charlie',
    last_name: 'Teamlead',
    password: 'CharlieTest123!',
  }),
} as const;

// ============================================================================
// Team Factories
// ============================================================================

/**
 * Create a test team
 */
export function createTestTeam(overrides: Partial<TestTeam> = {}): TestTeam {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    owner_id: faker.string.uuid(),
    created_at: faker.date.past({ years: 1 }).toISOString(),
    updated_at: faker.date.recent({ days: 30 }).toISOString(),
    ...overrides,
  };
}

/**
 * Create a personal team for a user
 * 
 * Personal teams are created automatically when users sign up.
 */
export function createPersonalTeam(userId: string): TestTeam {
  return createTestTeam({
    name: 'Personal',
    description: 'Personal team for individual projects',
    owner_id: userId,
  });
}

/**
 * Create a team member relationship
 */
export function createTestTeamMember(overrides: Partial<TestTeamMember> = {}): TestTeamMember {
  return {
    id: faker.string.uuid(),
    team_id: faker.string.uuid(),
    user_id: faker.string.uuid(),
    role: faker.helpers.arrayElement(['owner', 'admin', 'member', 'viewer']),
    joined_at: faker.date.past({ years: 1 }).toISOString(),
    updated_at: faker.date.recent({ days: 30 }).toISOString(),
    ...overrides,
  };
}

// ============================================================================
// Project Factories
// ============================================================================

/**
 * Create a test project with realistic budget and progress
 */
export function createTestProject(overrides: Partial<TestProject> = {}): TestProject {
  const budgetTotal = faker.number.int({ min: 500, max: 5000 });
  const budgetSpent = faker.number.int({ min: 0, max: budgetTotal });
  const progress = Math.round((budgetSpent / budgetTotal) * 100);

  return {
    id: faker.number.int({ min: 1, max: 999999 }),
    title: faker.commerce.productName(),
    character: faker.person.fullName(),
    series: faker.lorem.words(3),
    image: faker.image.urlPicsumPhotos({ width: 400, height: 600 }),
    progress,
    budget: {
      spent: budgetSpent,
      total: budgetTotal,
    },
    deadline: faker.date.future({ years: 1 }).toISOString(),
    status: faker.helpers.arrayElement(['idea', 'planning', 'in-progress', 'completed', 'archived']),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent({ days: 30 }),
    ...overrides,
  };
}

/**
 * Create an in-progress project (10-90% complete)
 */
export function createInProgressProject(overrides: Partial<TestProject> = {}): TestProject {
  const progress = faker.number.int({ min: 10, max: 90 });
  return createTestProject({
    status: 'in-progress',
    progress,
    ...overrides,
  });
}

/**
 * Create a completed project (100% complete)
 */
export function createCompletedProject(overrides: Partial<TestProject> = {}): TestProject {
  return createTestProject({
    status: 'completed',
    progress: 100,
    ...overrides,
  });
}

/**
 * Create an archived project
 */
export function createArchivedProject(overrides: Partial<TestProject> = {}): TestProject {
  return createTestProject({
    status: 'archived',
    progress: 100,
    ...overrides,
  });
}

/**
 * Create an idea project (just an idea, not started)
 */
export function createIdeaProject(overrides: Partial<TestProject> = {}): TestProject {
  return createTestProject({
    status: 'idea',
    progress: 0,
    ...overrides,
  });
}

/**
 * Create a planning project (early stages)
 */
export function createPlanningProject(overrides: Partial<TestProject> = {}): TestProject {
  return createTestProject({
    status: 'planning',
    progress: faker.number.int({ min: 0, max: 30 }),
    ...overrides,
  });
}

// ============================================================================
// Task Factories
// ============================================================================

/**
 * Create a test task
 */
export function createTestTask(overrides: Partial<TestTask> = {}): TestTask {
  return {
    id: faker.number.int({ min: 1, max: 999999 }),
    title: faker.lorem.sentence({ min: 3, max: 6 }),
    description: faker.lorem.paragraph(),
    completed: faker.datatype.boolean(),
    projectId: faker.number.int({ min: 1, max: 999 }),
    dueDate: faker.date.future({ years: 1 }),
    priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
    ...overrides,
  };
}

/**
 * Create a high-priority task (not completed)
 */
export function createHighPriorityTask(overrides: Partial<TestTask> = {}): TestTask {
  return createTestTask({
    priority: 'high',
    completed: false,
    ...overrides,
  });
}

/**
 * Create an overdue task (past due date, not completed)
 */
export function createOverdueTask(overrides: Partial<TestTask> = {}): TestTask {
  return createTestTask({
    dueDate: faker.date.past({ days: 7 }),
    completed: false,
    priority: 'high',
    ...overrides,
  });
}

// ============================================================================
// Event Factories
// ============================================================================

/**
 * Create a test event
 */
export function createTestEvent(overrides: Partial<TestEvent> = {}): TestEvent {
  return {
    id: faker.number.int({ min: 1, max: 999999 }),
    title: faker.lorem.sentence({ min: 2, max: 5 }),
    description: faker.lorem.paragraph(),
    date: faker.date.future({ years: 1 }),
    type: faker.helpers.arrayElement(['convention', 'photoshoot', 'deadline', 'other']),
    projectId: faker.number.int({ min: 1, max: 999 }),
    ...overrides,
  };
}

/**
 * Create a convention event
 */
export function createConventionEvent(overrides: Partial<TestEvent> = {}): TestEvent {
  return createTestEvent({
    type: 'convention',
    title: faker.company.name() + ' Con',
    ...overrides,
  });
}

/**
 * Create a photoshoot event
 */
export function createPhotoshootEvent(overrides: Partial<TestEvent> = {}): TestEvent {
  return createTestEvent({
    type: 'photoshoot',
    title: 'Photoshoot: ' + faker.location.city(),
    ...overrides,
  });
}

// ============================================================================
// Character Factories
// ============================================================================

/**
 * Create a test character
 */
export function createTestCharacter(overrides: Partial<TestCharacter> = {}): TestCharacter {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    series: faker.lorem.words(3),
    source_medium: faker.helpers.arrayElement(['anime', 'manga', 'game', 'movie', 'tv', 'book', 'original']),
    team_id: faker.string.uuid(),
    reference_images: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () =>
      faker.image.urlPicsumPhotos({ width: 400, height: 600 })
    ),
    budget_mode: faker.helpers.arrayElement(['personal', 'commission']),
    budget_limit: faker.number.int({ min: 100, max: 2000 }),
    completion_percentage: faker.number.int({ min: 0, max: 100 }),
    created_at: faker.date.past({ years: 1 }).toISOString(),
    updated_at: faker.date.recent({ days: 30 }).toISOString(),
    ...overrides,
  };
}

// ============================================================================
// Batch Creation Utilities
// ============================================================================

/**
 * Create multiple test users at once
 * 
 * @param count - Number of users to create
 * @param overrides - Common overrides for all users
 * @returns Array of test users
 */
export function createTestUsers(count: number, overrides: Partial<TestUser> = {}): TestUser[] {
  return Array.from({ length: count }, () => createTestUser(overrides));
}

/**
 * Create multiple test projects at once
 */
export function createTestProjects(count: number, overrides: Partial<TestProject> = {}): TestProject[] {
  return Array.from({ length: count }, () => createTestProject(overrides));
}

/**
 * Create multiple test tasks at once
 */
export function createTestTasks(count: number, overrides: Partial<TestTask> = {}): TestTask[] {
  return Array.from({ length: count }, () => createTestTask(overrides));
}

/**
 * Create multiple test events at once
 */
export function createTestEvents(count: number, overrides: Partial<TestEvent> = {}): TestEvent[] {
  return Array.from({ length: count }, () => createTestEvent(overrides));
}

/**
 * Create multiple test characters at once
 */
export function createTestCharacters(count: number, overrides: Partial<TestCharacter> = {}): TestCharacter[] {
  return Array.from({ length: count }, () => createTestCharacter(overrides));
}

// ============================================================================
// Faker Seed Control
// ============================================================================

/**
 * Use deterministic factory (same data every run)
 * 
 * Useful for debugging specific test failures.
 * 
 * @param seed - Fixed seed value (default: 12345)
 */
export function useDeterministicFactory(seed: number = 12345): void {
  faker.seed(seed);
  console.log(`🌱 Using deterministic factory with seed: ${seed}`);
}

/**
 * Use random factory (different data every run)
 * 
 * This is the default - catches more edge cases.
 */
export function useRandomFactory(): void {
  faker.seed(Date.now());
  console.log('🎲 Using random factory');
}

// Initialize with random seed by default
useRandomFactory();

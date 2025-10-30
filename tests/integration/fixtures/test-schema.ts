/**
 * Test Schema Setup Utility
 * 
 * Provides a complete test environment setup for integration tests.
 * Creates isolated schema, seeds with test data, returns cleanup function.
 * 
 * Usage:
 * ```typescript
 * describe('My Integration Test', () => {
 *   let context: TestSchemaContext;
 * 
 *   beforeAll(async () => {
 *     context = await setupTestSchema();
 *   });
 * 
 *   afterAll(async () => {
 *     await context.cleanup();
 *   });
 * 
 *   it('tests something', async () => {
 *     // Use context.users, context.teams, context.projects
 *     // All queries scoped to context.schemaName
 *   });
 * });
 * ```
 */

import {
  createSchema,
  cloneSchemaStructure,
  dropSchema,
} from '../../utils/test-database';
import {
  createTestUser,
  createPersonalTeam,
  createTestTeam,
  createTestProject,
  FIXED_TEST_USERS,
  type TestUser,
  type TestTeam,
  type TestProject,
} from '../../utils/factory';
import { createTestClient } from '../../utils/test-supabase';

/**
 * Test schema context with seeded data and cleanup function
 */
export interface TestSchemaContext {
  /** Unique schema name for this test run */
  schemaName: string;
  /** Seeded test users (alice, bob, charlie) */
  users: TestUser[];
  /** Seeded test teams (personal teams + 1 shared team) */
  teams: TestTeam[];
  /** Seeded test projects (2-3 per team) */
  projects: TestProject[];
  /** Cleanup function to drop schema after tests */
  cleanup: () => Promise<void>;
}

/**
 * Set up a complete test schema with seeded data
 * 
 * Creates isolated schema, clones structure from public schema,
 * seeds with test users, teams, and projects.
 * 
 * @param sourceSchema - Schema to clone structure from (default: 'public')
 * @param seedData - Whether to seed test data (default: true)
 * @returns Test schema context with cleanup function
 * 
 * @example
 * ```typescript
 * const context = await setupTestSchema();
 * 
 * // Access seeded data
 * console.log(`Users: ${context.users.length}`);
 * console.log(`Teams: ${context.teams.length}`);
 * console.log(`Projects: ${context.projects.length}`);
 * 
 * // Cleanup after tests
 * await context.cleanup();
 * ```
 */
export async function setupTestSchema(
  sourceSchema: string = 'public',
  seedData: boolean = true
): Promise<TestSchemaContext> {
  // 1. Create isolated schema
  const schemaName = await createSchema();

  // 2. Clone table structure from source schema
  await cloneSchemaStructure(sourceSchema, schemaName);

  // 3. Seed with test data (if enabled)
  let users: TestUser[] = [];
  let teams: TestTeam[] = [];
  let projects: TestProject[] = [];

  if (seedData) {
    users = await seedUsers(schemaName);
    teams = await seedTeams(schemaName, users);
    projects = await seedProjects(schemaName, teams);
  }

  // 4. Return context with cleanup function
  return {
    schemaName,
    users,
    teams,
    projects,
    cleanup: async () => {
      await dropSchema(schemaName);
    },
  };
}

/**
 * Seed test users into schema
 * 
 * Creates the 3 fixed test users (alice, bob, charlie) for consistent testing.
 */
async function seedUsers(schemaName: string): Promise<TestUser[]> {
  const client = createTestClient(schemaName);

  const users = [
    FIXED_TEST_USERS.alice,
    FIXED_TEST_USERS.bob,
    FIXED_TEST_USERS.charlie,
  ];

  for (const user of users) {
    const { password, ...userData } = user;

    try {
      await client.from('users').insert(userData);
    } catch (error: any) {
      console.warn(`Could not insert user ${user.email}:`, error.message);
    }
  }

  console.log(`  ✓ Seeded ${users.length} test users`);
  return users;
}

/**
 * Seed test teams into schema
 * 
 * Creates personal team for each user + 1 shared team with all users as members.
 */
async function seedTeams(schemaName: string, users: TestUser[]): Promise<TestTeam[]> {
  const client = createTestClient(schemaName);
  const teams: TestTeam[] = [];

  // Create personal team for each user
  for (const user of users) {
    const team = createPersonalTeam(user.id);

    try {
      await client.from('teams').insert(team);

      // Add user as owner of their personal team
      await client.from('team_members').insert({
        team_id: team.id,
        user_id: user.id,
        role: 'owner',
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      teams.push(team);
    } catch (error: any) {
      console.warn(`Could not create personal team for ${user.email}:`, error.message);
    }
  }

  // Create one shared team with all users
  const sharedTeam = createTestTeam({
    name: 'Shared Team',
    description: 'Shared team for collaboration',
    owner_id: users[0].id,
  });

  try {
    await client.from('teams').insert(sharedTeam);

    // Add all users to shared team
    for (let i = 0; i < users.length; i++) {
      await client.from('team_members').insert({
        team_id: sharedTeam.id,
        user_id: users[i].id,
        role: i === 0 ? 'owner' : 'member', // First user is owner
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    teams.push(sharedTeam);
  } catch (error: any) {
    console.warn('Could not create shared team:', error.message);
  }

  console.log(`  ✓ Seeded ${teams.length} test teams`);
  return teams;
}

/**
 * Seed test projects into schema
 * 
 * Creates 2-3 projects per team with varied statuses.
 */
async function seedProjects(schemaName: string, teams: TestTeam[]): Promise<TestProject[]> {
  const client = createTestClient(schemaName);
  const projects: TestProject[] = [];

  for (const team of teams) {
    // Create 2-3 projects per team
    const projectCount = Math.floor(Math.random() * 2) + 2; // 2 or 3

    for (let i = 0; i < projectCount; i++) {
      const statuses: Array<'idea' | 'planning' | 'in-progress' | 'completed' | 'archived'> = [
        'idea',
        'planning',
        'in-progress',
        'completed',
        'archived',
      ];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const project = createTestProject({
        status,
        // team_id: team.id, // Uncomment when database schema supports it
      });

      try {
        await client.from('projects').insert({
          title: project.title,
          character: project.character,
          series: project.series,
          image: project.image,
          progress: project.progress,
          // budget_spent: project.budget.spent,
          // budget_total: project.budget.total,
          deadline: project.deadline,
          status: project.status,
          created_at: project.createdAt.toISOString(),
          updated_at: project.updatedAt.toISOString(),
        });

        projects.push(project);
      } catch (error: any) {
        console.warn(`Could not create project ${project.title}:`, error.message);
      }
    }
  }

  console.log(`  ✓ Seeded ${projects.length} test projects`);
  return projects;
}

/**
 * Create minimal test schema without seeding data
 * 
 * Useful when you want to control test data manually.
 * 
 * @example
 * ```typescript
 * const context = await createMinimalTestSchema();
 * 
 * // Manually insert test data
 * const client = createTestClient(context.schemaName);
 * await client.from('users').insert(myTestUser);
 * 
 * await context.cleanup();
 * ```
 */
export async function createMinimalTestSchema(): Promise<TestSchemaContext> {
  return setupTestSchema('public', false);
}

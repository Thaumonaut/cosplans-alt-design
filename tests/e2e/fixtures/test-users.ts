/**
 * E2E Test Users Fixture
 * 
 * Fixed test users for consistent E2E authentication tests.
 * These users have predetermined emails and passwords for login tests.
 * 
 * Usage:
 * ```typescript
 * import { FIXED_TEST_USERS } from '../fixtures/test-users';
 * 
 * test('user can login', async ({ page }) => {
 *   await loginPage.login(
 *     FIXED_TEST_USERS.alice.email,
 *     FIXED_TEST_USERS.alice.password
 *   );
 * });
 * ```
 */

import { FIXED_TEST_USERS as FACTORY_USERS } from '../../utils/factory';

/**
 * Export fixed test users from factory
 * 
 * These users are used consistently across all E2E tests for authentication.
 */
export const FIXED_TEST_USERS = FACTORY_USERS;

/**
 * Helper to get test user credentials
 */
export function getTestUserCredentials(username: 'alice' | 'bob' | 'charlie') {
  const user = FIXED_TEST_USERS[username];
  return {
    email: user.email,
    password: user.password!,
  };
}

/**
 * All test user emails for bulk operations
 */
export const TEST_USER_EMAILS = [
  FIXED_TEST_USERS.alice.email,
  FIXED_TEST_USERS.bob.email,
  FIXED_TEST_USERS.charlie.email,
] as const;

/**
 * Test user roles and purposes
 */
export const TEST_USER_ROLES = {
  /**
   * Alice: Primary test user for most E2E tests
   * - Has a personal team
   * - Member of shared team
   * - Has multiple projects
   */
  alice: {
    ...FIXED_TEST_USERS.alice,
    purpose: 'Primary test user - standard workflows',
    teams: ['personal', 'shared'],
  },

  /**
   * Bob: Secondary test user for collaboration tests
   * - Has a personal team
   * - Member of shared team
   * - Used for testing team collaboration
   */
  bob: {
    ...FIXED_TEST_USERS.bob,
    purpose: 'Secondary user - team collaboration tests',
    teams: ['personal', 'shared'],
  },

  /**
   * Charlie: Team lead test user for permission tests
   * - Has a personal team
   * - Owner of shared team
   * - Used for testing admin/owner permissions
   */
  charlie: {
    ...FIXED_TEST_USERS.charlie,
    purpose: 'Team lead - permission and admin tests',
    teams: ['personal', 'shared (owner)'],
  },
} as const;

/**
 * Edge case user credentials for negative testing
 */
export const INVALID_USERS = {
  /**
   * Non-existent user (should fail login)
   */
  nonExistent: {
    email: 'nonexistent@test.com',
    password: 'WrongPassword123!',
  },

  /**
   * User with invalid email format
   */
  invalidEmail: {
    email: 'not-an-email',
    password: 'Password123!',
  },

  /**
   * User with weak password
   */
  weakPassword: {
    email: 'weak@test.com',
    password: '123',
  },

  /**
   * User with SQL injection attempt
   */
  sqlInjection: {
    email: "admin'--",
    password: "' OR '1'='1",
  },

  /**
   * User with XSS attempt
   */
  xssAttempt: {
    email: '<script>alert("XSS")</script>@test.com',
    password: '<img src=x onerror=alert(1)>',
  },
} as const;

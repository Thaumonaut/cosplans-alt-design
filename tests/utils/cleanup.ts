/**
 * Test Data Cleanup Utilities
 * 
 * Provides functions to clean up test data and schemas.
 * Prevents orphaned data from accumulating in test database.
 * 
 * Usage:
 * ```typescript
 * // In afterAll hook
 * afterAll(async () => {
 *   await cleanupTestData(schemaName);
 * });
 * ```
 */

import {
  testSupabase,
  dropSchema,
  cleanupOrphanedSchemas,
  listTestSchemas,
  cleanupAllTestSchemas,
} from './test-database';
import { createTestClient } from './test-supabase';

/**
 * Clean up all data from a specific test schema
 * 
 * Deletes all records from all tables in the schema.
 * Useful when you want to reset schema state without dropping it.
 * 
 * @param schemaName - Test schema name
 * 
 * @example
 * ```typescript
 * await cleanupTestData('test_1709123456789_abc123');
 * ```
 */
export async function cleanupTestData(schemaName: string): Promise<void> {
  try {
    const client = createTestClient(schemaName);

    // List of tables to clean (in dependency order to avoid FK violations)
    const tables = [
      'task_dependencies',
      'tasks',
      'team_members',
      'projects',
      'characters',
      'events',
      'teams',
      'users',
      // Add more tables as needed
    ];

    for (const table of tables) {
      try {
        await client.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log(`  ✓ Cleaned table: ${schemaName}.${table}`);
      } catch (error: any) {
        // Table might not exist or be empty - continue
        console.log(`  ⚠️  Could not clean ${table}:`, error.message);
      }
    }

    console.log(`✓ Cleaned test data from schema: ${schemaName}`);
  } catch (error) {
    console.error(`❌ Failed to clean test data from ${schemaName}:`, error);
  }
}

/**
 * Reset a test database by dropping and recreating the schema
 * 
 * More thorough than cleanupTestData - completely removes and recreates schema.
 * 
 * @param schemaName - Test schema name
 * 
 * @example
 * ```typescript
 * await resetTestDatabase('test_1709123456789_abc123');
 * ```
 */
export async function resetTestDatabase(schemaName: string): Promise<void> {
  console.log(`Resetting test database: ${schemaName}`);

  // Drop existing schema
  await dropSchema(schemaName);

  console.log(`✓ Reset test database: ${schemaName}`);
}

/**
 * Cleanup utility for integration tests
 * 
 * Call this in afterAll hook to ensure schema is cleaned up.
 * 
 * @param schemaName - Test schema name
 * @param skipCleanup - Skip cleanup if true (for debugging)
 * 
 * @example
 * ```typescript
 * describe('My Integration Test', () => {
 *   let schemaName: string;
 * 
 *   beforeAll(async () => {
 *     schemaName = await createSchema();
 *   });
 * 
 *   afterAll(async () => {
 *     await cleanupAfterTests(schemaName);
 *   });
 * });
 * ```
 */
export async function cleanupAfterTests(schemaName: string, skipCleanup = false): Promise<void> {
  if (skipCleanup || process.env.TEST_SKIP_CLEANUP === '1') {
    console.log(`⏭️  Skipping cleanup for schema: ${schemaName}`);
    console.log(`   To clean up manually, run: bun run test:cleanup`);
    return;
  }

  await dropSchema(schemaName);
}

/**
 * Cleanup orphaned test schemas older than specified age
 * 
 * Run this periodically to prevent test schema accumulation.
 * 
 * @param maxAgeHours - Maximum age in hours (default: 1)
 * @returns Number of schemas cleaned up
 * 
 * @example
 * ```typescript
 * // Cleanup schemas older than 2 hours
 * const count = await cleanupOldTestSchemas(2);
 * console.log(`Cleaned up ${count} orphaned schemas`);
 * ```
 */
export async function cleanupOldTestSchemas(maxAgeHours = 1): Promise<number> {
  const droppedSchemas = await cleanupOrphanedSchemas(maxAgeHours);
  return droppedSchemas.length;
}

/**
 * Emergency cleanup - remove ALL test schemas
 * 
 * Use with caution: will interrupt any running tests.
 * Only use this for manual cleanup or CI/CD maintenance.
 * 
 * @example
 * ```typescript
 * // Nuclear option: clean up everything
 * await emergencyCleanup();
 * ```
 */
export async function emergencyCleanup(): Promise<void> {
  console.warn('⚠️  EMERGENCY CLEANUP: Removing ALL test schemas');
  console.warn('   This will interrupt any running tests!');

  await cleanupAllTestSchemas();

  console.log('✓ Emergency cleanup complete');
}

/**
 * Get test database statistics
 * 
 * Reports on schema count and age distribution.
 * Useful for monitoring test database health.
 * 
 * @returns Statistics object
 * 
 * @example
 * ```typescript
 * const stats = await getTestDatabaseStats();
 * console.log(`Active test schemas: ${stats.total}`);
 * console.log(`Old schemas (>1h): ${stats.old}`);
 * ```
 */
export async function getTestDatabaseStats(): Promise<{
  total: number;
  byAge: {
    fresh: number; // < 5 minutes
    recent: number; // 5min - 1 hour
    old: number; // > 1 hour
  };
  schemas: Array<{ name: string; ageMinutes: number }>;
}> {
  const schemas = await listTestSchemas();
  const now = Date.now();

  const schemaDetails = schemas.map((name) => {
    // Extract timestamp from schema name (test_<timestamp>_<random>)
    const match = name.match(/^test_(\d+)_/);
    const timestamp = match ? parseInt(match[1], 10) : 0;
    const ageMs = now - timestamp;
    const ageMinutes = Math.round(ageMs / (60 * 1000));

    return { name, ageMinutes };
  });

  const byAge = {
    fresh: schemaDetails.filter((s) => s.ageMinutes < 5).length,
    recent: schemaDetails.filter((s) => s.ageMinutes >= 5 && s.ageMinutes < 60).length,
    old: schemaDetails.filter((s) => s.ageMinutes >= 60).length,
  };

  return {
    total: schemas.length,
    byAge,
    schemas: schemaDetails,
  };
}

/**
 * Report test database health
 * 
 * Prints a summary of test database status to console.
 * 
 * @example
 * ```typescript
 * await reportTestDatabaseHealth();
 * ```
 */
export async function reportTestDatabaseHealth(): Promise<void> {
  console.log('\n📊 Test Database Health Report');
  console.log('================================');

  const stats = await getTestDatabaseStats();

  console.log(`Total test schemas: ${stats.total}`);
  console.log(`  • Fresh (< 5 min): ${stats.byAge.fresh}`);
  console.log(`  • Recent (5min - 1h): ${stats.byAge.recent}`);
  console.log(`  • Old (> 1h): ${stats.byAge.old}`);

  if (stats.byAge.old > 0) {
    console.log('\n⚠️  Warning: Found orphaned schemas older than 1 hour');
    console.log('   Run cleanup: bun run test:cleanup');
  } else {
    console.log('\n✓ No orphaned schemas found');
  }

  console.log('================================\n');
}

/**
 * CLI script entry point for manual cleanup
 * 
 * Run with: bun run tests/utils/cleanup.ts
 */
if (import.meta.main) {
  console.log('🧹 Test Database Cleanup Script\n');

  await reportTestDatabaseHealth();

  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question('Clean up orphaned schemas older than 1 hour? (yes/no): ', resolve);
  });

  rl.close();

  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    const count = await cleanupOldTestSchemas(1);
    console.log(`\n✓ Cleaned up ${count} orphaned schemas`);
  } else {
    console.log('\n⏭️  Cleanup skipped');
  }
}

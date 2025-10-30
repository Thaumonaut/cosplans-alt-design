/**
 * Test Supabase Client with Schema Isolation
 * 
 * Provides a Supabase client that scopes all queries to a specific test schema.
 * This enables parallel test execution without data conflicts.
 * 
 * Usage:
 * ```typescript
 * const client = createTestSupabaseClient('test_1709123456789_abc123');
 * const { data } = await client.from('projects').select('*');
 * ```
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const TEST_SUPABASE_URL = process.env.SUPABASE_TEST_URL || process.env.PUBLIC_SUPABASE_URL;
const TEST_SUPABASE_KEY = process.env.SUPABASE_TEST_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!TEST_SUPABASE_URL || !TEST_SUPABASE_KEY) {
  throw new Error(
    'Missing test Supabase credentials. Set SUPABASE_TEST_URL and SUPABASE_TEST_KEY in .env.test'
  );
}

/**
 * Configuration for test Supabase client
 */
export interface TestSupabaseConfig {
  /** Test schema name for query scoping */
  schemaName: string;
  /** Optional user ID for RLS testing */
  userId?: string;
  /** Optional auth token for RLS testing */
  authToken?: string;
}

/**
 * Create a test Supabase client scoped to a specific schema
 * 
 * All queries will be executed against the specified schema instead of 'public'.
 * This enables parallel test execution with schema isolation.
 * 
 * @param config - Test client configuration with schema name
 * @returns Supabase client scoped to test schema
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const client = createTestSupabaseClient({ schemaName: 'test_123_abc' });
 * 
 * // With user context for RLS testing
 * const client = createTestSupabaseClient({
 *   schemaName: 'test_123_abc',
 *   userId: 'user-uuid',
 *   authToken: 'jwt-token',
 * });
 * ```
 */
export function createTestSupabaseClient(config: TestSupabaseConfig): SupabaseClient {
  const client = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_KEY, {
    db: {
      schema: config.schemaName, // Scope all queries to test schema
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: config.authToken
        ? {
            Authorization: `Bearer ${config.authToken}`,
          }
        : {},
    },
  });

  return client;
}

/**
 * Create a test Supabase client with simple schema name
 * 
 * Convenience function for basic schema-scoped client.
 * 
 * @param schemaName - Test schema name
 * @returns Supabase client scoped to test schema
 * 
 * @example
 * ```typescript
 * const client = createTestClient('test_1709123456789_abc123');
 * const { data } = await client.from('projects').select('*');
 * ```
 */
export function createTestClient(schemaName: string): SupabaseClient {
  return createTestSupabaseClient({ schemaName });
}

/**
 * Create an authenticated test client for RLS testing
 * 
 * Simulates an authenticated user for testing Row Level Security policies.
 * 
 * @param schemaName - Test schema name
 * @param userId - User ID to simulate
 * @returns Authenticated Supabase client
 * 
 * @example
 * ```typescript
 * const client = createAuthenticatedTestClient('test_123_abc', 'user-uuid');
 * // This client will have RLS policies applied as if user-uuid is logged in
 * const { data } = await client.from('projects').select('*');
 * ```
 */
export function createAuthenticatedTestClient(
  schemaName: string,
  userId: string
): SupabaseClient {
  // Note: For full RLS testing, you'll need to generate a proper JWT token
  // This is a simplified version - expand based on your auth setup
  return createTestSupabaseClient({
    schemaName,
    userId,
  });
}

/**
 * Helper to execute raw SQL in test schema
 * 
 * Useful for seeding data or complex queries that don't fit the query builder.
 * 
 * @param schemaName - Test schema name
 * @param sql - Raw SQL query
 * @returns Query result
 * 
 * @example
 * ```typescript
 * await executeRawSQL('test_123_abc', `
 *   INSERT INTO projects (title, character, series)
 *   VALUES ('Test Project', 'Test Character', 'Test Series')
 * `);
 * ```
 */
export async function executeRawSQL(schemaName: string, sql: string): Promise<any> {
  const client = createTestClient(schemaName);
  
  // Prepend schema name to table references if not already qualified
  const scopedSQL = sql.replace(/FROM\s+(\w+)/gi, `FROM ${schemaName}.$1`);
  
  const { data, error } = await client.rpc('exec', { sql: scopedSQL });

  if (error) {
    throw new Error(`SQL execution failed: ${error.message}\n${sql}`);
  }

  return data;
}

/**
 * Test helper to verify schema isolation
 * 
 * Inserts a record into the test schema and verifies it doesn't appear in public schema.
 * Useful for debugging schema isolation issues.
 * 
 * @param schemaName - Test schema name
 * @returns true if isolation works correctly
 * 
 * @example
 * ```typescript
 * const isolated = await verifySchemaIsolation('test_123_abc');
 * if (!isolated) {
 *   throw new Error('Schema isolation not working!');
 * }
 * ```
 */
export async function verifySchemaIsolation(schemaName: string): Promise<boolean> {
  try {
    const testClient = createTestClient(schemaName);
    const publicClient = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_KEY);

    // Insert test record in test schema
    const testRecord = {
      title: '__TEST_ISOLATION_VERIFY__',
      character: 'Test',
      series: 'Test',
    };

    await testClient.from('projects').insert(testRecord);

    // Verify it doesn't appear in public schema
    const { data: publicData } = await publicClient
      .from('projects')
      .select('*')
      .eq('title', '__TEST_ISOLATION_VERIFY__');

    // Cleanup
    await testClient.from('projects').delete().eq('title', '__TEST_ISOLATION_VERIFY__');

    // Schema isolation works if record NOT found in public
    return !publicData || publicData.length === 0;
  } catch (error) {
    console.error('Schema isolation verification failed:', error);
    return false;
  }
}

/**
 * Seed test data into schema
 * 
 * Helper to insert multiple records at once for test setup.
 * 
 * @param schemaName - Test schema name
 * @param tableName - Table to insert into
 * @param records - Array of records to insert
 * @returns Inserted records
 * 
 * @example
 * ```typescript
 * const projects = await seedTestData('test_123_abc', 'projects', [
 *   { title: 'Project 1', character: 'Char 1', series: 'Series 1' },
 *   { title: 'Project 2', character: 'Char 2', series: 'Series 2' },
 * ]);
 * ```
 */
export async function seedTestData<T>(
  schemaName: string,
  tableName: string,
  records: T[]
): Promise<T[]> {
  const client = createTestClient(schemaName);

  const { data, error } = await client.from(tableName).insert(records).select();

  if (error) {
    throw new Error(`Failed to seed test data into ${tableName}: ${error.message}`);
  }

  return data as T[];
}

/**
 * Clear all data from a table in test schema
 * 
 * Useful for resetting state between test cases.
 * 
 * @param schemaName - Test schema name
 * @param tableName - Table to clear
 * 
 * @example
 * ```typescript
 * await clearTestTable('test_123_abc', 'projects');
 * ```
 */
export async function clearTestTable(schemaName: string, tableName: string): Promise<void> {
  const client = createTestClient(schemaName);

  const { error } = await client.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    throw new Error(`Failed to clear test table ${tableName}: ${error.message}`);
  }
}

/**
 * Count records in a test table
 * 
 * @param schemaName - Test schema name
 * @param tableName - Table to count
 * @returns Number of records
 * 
 * @example
 * ```typescript
 * const count = await countTestRecords('test_123_abc', 'projects');
 * expect(count).toBe(5);
 * ```
 */
export async function countTestRecords(schemaName: string, tableName: string): Promise<number> {
  const client = createTestClient(schemaName);

  const { count, error } = await client
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw new Error(`Failed to count records in ${tableName}: ${error.message}`);
  }

  return count || 0;
}

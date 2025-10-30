/**
 * Test Database Utilities
 * 
 * Provides schema isolation for parallel test execution.
 * Each test run creates a unique database schema to prevent data conflicts.
 * 
 * Usage:
 * ```typescript
 * const schemaName = await createSchema();
 * await cloneSchemaStructure('public', schemaName);
 * // ... run tests ...
 * await dropSchema(schemaName);
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
 * Shared test Supabase client for database operations
 */
export const testSupabase = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Generate unique schema name for test isolation
 * Format: test_<timestamp>_<randomId>
 * 
 * Example: test_1709123456789_abc123
 */
export function generateSchemaName(): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  return `test_${timestamp}_${randomId}`;
}

/**
 * Create a new test schema with a unique name
 * 
 * @param schemaName - Optional custom schema name (defaults to generated name)
 * @returns The schema name that was created
 * 
 * @throws Error if schema creation fails
 * 
 * @example
 * ```typescript
 * const schemaName = await createSchema();
 * // => 'test_1709123456789_abc123'
 * ```
 */
export async function createSchema(schemaName?: string): Promise<string> {
  const name = schemaName || generateSchemaName();

  const { error } = await testSupabase.rpc('create_test_schema', {
    schema_name: name,
  });

  if (error) {
    throw new Error(`Failed to create test schema ${name}: ${error.message}`);
  }

  console.log(`✓ Created test schema: ${name}`);
  return name;
}

/**
 * Clone table structure from source schema to target schema
 * 
 * Copies all tables, columns, constraints, and indexes from source to target.
 * Does NOT copy data - only structure.
 * 
 * @param sourceSchema - Source schema to clone from (typically 'public')
 * @param targetSchema - Target schema to clone into (test schema)
 * 
 * @throws Error if cloning fails
 * 
 * @example
 * ```typescript
 * await cloneSchemaStructure('public', 'test_1709123456789_abc123');
 * ```
 */
export async function cloneSchemaStructure(
  sourceSchema: string,
  targetSchema: string
): Promise<void> {
  const { error } = await testSupabase.rpc('clone_schema_structure', {
    source_schema: sourceSchema,
    target_schema: targetSchema,
  });

  if (error) {
    throw new Error(
      `Failed to clone schema structure from ${sourceSchema} to ${targetSchema}: ${error.message}`
    );
  }

  console.log(`✓ Cloned schema structure: ${sourceSchema} → ${targetSchema}`);
}

/**
 * Drop a test schema and all its contents
 * 
 * Safety: Only schemas with 'test_' prefix can be dropped.
 * Uses CASCADE to remove all tables, sequences, and views.
 * 
 * @param schemaName - Name of test schema to drop
 * 
 * @note Errors are logged but don't throw (cleanup failures shouldn't fail tests)
 * 
 * @example
 * ```typescript
 * await dropSchema('test_1709123456789_abc123');
 * ```
 */
export async function dropSchema(schemaName: string): Promise<void> {
  // Safety check: only drop test schemas
  if (!schemaName.startsWith('test_')) {
    console.error(`❌ Cannot drop non-test schema: ${schemaName}`);
    return;
  }

  const { error } = await testSupabase.rpc('drop_test_schema', {
    schema_name: schemaName,
  });

  if (error) {
    console.error(`⚠️  Failed to drop test schema ${schemaName}:`, error.message);
    // Don't throw - cleanup errors shouldn't fail tests
  } else {
    console.log(`✓ Dropped test schema: ${schemaName}`);
  }
}

/**
 * List all test schemas in the database
 * 
 * @returns Array of test schema names (matching 'test_%' pattern)
 * 
 * @example
 * ```typescript
 * const schemas = await listTestSchemas();
 * // => ['test_1709123456789_abc123', 'test_1709123456790_def456']
 * ```
 */
export async function listTestSchemas(): Promise<string[]> {
  const { data, error } = await testSupabase.rpc('list_test_schemas');

  if (error) {
    throw new Error(`Failed to list test schemas: ${error.message}`);
  }

  return (data as string[]) || [];
}

/**
 * Cleanup orphaned test schemas older than specified age
 * 
 * Orphaned schemas can occur if tests crash or are interrupted.
 * This function removes old test schemas based on timestamp in schema name.
 * 
 * @param maxAgeHours - Maximum age in hours (default: 1 hour)
 * @returns Array of dropped schema names
 * 
 * @example
 * ```typescript
 * // Cleanup schemas older than 2 hours
 * const dropped = await cleanupOrphanedSchemas(2);
 * console.log(`Dropped ${dropped.length} orphaned schemas`);
 * ```
 */
export async function cleanupOrphanedSchemas(maxAgeHours: number = 1): Promise<string[]> {
  const { data, error } = await testSupabase.rpc('cleanup_orphaned_test_schemas', {
    max_age_hours: maxAgeHours,
  });

  if (error) {
    throw new Error(`Failed to cleanup orphaned schemas: ${error.message}`);
  }

  const droppedSchemas = (data as string[]) || [];
  
  if (droppedSchemas.length > 0) {
    console.log(`✓ Cleaned up ${droppedSchemas.length} orphaned test schemas`);
    droppedSchemas.forEach((schema) => console.log(`  - ${schema}`));
  } else {
    console.log('✓ No orphaned test schemas found');
  }

  return droppedSchemas;
}

/**
 * Manual schema cleanup function
 * 
 * Drops ALL test schemas in the database.
 * Use with caution - will interrupt running tests.
 * 
 * @example
 * ```typescript
 * // Cleanup all test schemas (dangerous!)
 * await cleanupAllTestSchemas();
 * ```
 */
export async function cleanupAllTestSchemas(): Promise<void> {
  const schemas = await listTestSchemas();

  if (schemas.length === 0) {
    console.log('✓ No test schemas to clean up');
    return;
  }

  console.log(`Cleaning up ${schemas.length} test schemas...`);

  for (const schema of schemas) {
    await dropSchema(schema);
  }

  console.log(`✓ Cleaned up ${schemas.length} test schemas`);
}

/**
 * Test schema lifecycle helper
 * 
 * Creates a test schema with automatic cleanup via callback.
 * Preferred pattern for integration tests.
 * 
 * @param sourceSchema - Schema to clone structure from (default: 'public')
 * @returns Object with schema name and cleanup function
 * 
 * @example
 * ```typescript
 * const { schemaName, cleanup } = await createTestSchemaWithCleanup();
 * try {
 *   // ... run tests with schemaName ...
 * } finally {
 *   await cleanup();
 * }
 * ```
 */
export async function createTestSchemaWithCleanup(sourceSchema: string = 'public'): Promise<{
  schemaName: string;
  cleanup: () => Promise<void>;
}> {
  const schemaName = await createSchema();
  await cloneSchemaStructure(sourceSchema, schemaName);

  return {
    schemaName,
    cleanup: async () => {
      await dropSchema(schemaName);
    },
  };
}

/**
 * Verify test database connection
 * 
 * Useful for debugging environment setup issues.
 * 
 * @returns true if connection successful, false otherwise
 * 
 * @example
 * ```typescript
 * if (!await verifyConnection()) {
 *   throw new Error('Cannot connect to test database');
 * }
 * ```
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    const { error } = await testSupabase.rpc('list_test_schemas');
    
    if (error) {
      console.error('❌ Test database connection failed:', error.message);
      return false;
    }

    console.log('✓ Test database connection verified');
    return true;
  } catch (err) {
    console.error('❌ Test database connection error:', err);
    return false;
  }
}

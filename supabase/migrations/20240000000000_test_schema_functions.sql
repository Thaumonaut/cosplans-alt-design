-- Moved earlier to avoid version collision
-- Test Schema Management Functions
-- These functions enable database schema isolation for parallel test execution
-- Each test run creates its own schema namespace to prevent data conflicts

-- ============================================================================
-- Function: create_test_schema
-- Purpose: Create a new isolated schema for test execution
-- Usage: SELECT create_test_schema('test_1234567890_abc123');
-- ============================================================================
CREATE OR REPLACE FUNCTION create_test_schema(schema_name TEXT)
RETURNS VOID AS $$
BEGIN
  -- Validate schema name starts with 'test_' for safety
  IF schema_name NOT LIKE 'test_%' THEN
    RAISE EXCEPTION 'Schema name must start with test_ prefix. Got: %', schema_name;
  END IF;

  -- Create the schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
  
  -- Grant usage permissions (adjust based on your setup)
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO PUBLIC', schema_name);
  EXECUTE format('GRANT CREATE ON SCHEMA %I TO PUBLIC', schema_name);
  
  RAISE NOTICE 'Created test schema: %', schema_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function: clone_schema_structure
-- Purpose: Copy table structure from source schema to target schema
-- Usage: SELECT clone_schema_structure('public', 'test_1234567890_abc123');
-- Note: Copies table structure only, NOT data or constraints
-- ============================================================================
CREATE OR REPLACE FUNCTION clone_schema_structure(source_schema TEXT, target_schema TEXT)
RETURNS VOID AS $$
DECLARE
  table_record RECORD;
  sequence_record RECORD;
BEGIN
  -- Validate target schema is a test schema
  IF target_schema NOT LIKE 'test_%' THEN
    RAISE EXCEPTION 'Target schema must start with test_ prefix. Got: %', target_schema;
  END IF;

  -- Clone all tables from source schema
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = source_schema
    ORDER BY tablename
  LOOP
    -- Create table with same structure (INCLUDING ALL copies defaults, constraints, indexes)
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I.%I (LIKE %I.%I INCLUDING ALL)',
      target_schema, table_record.tablename,
      source_schema, table_record.tablename
    );
    
    RAISE NOTICE 'Cloned table: %.% -> %.%', 
      source_schema, table_record.tablename,
      target_schema, table_record.tablename;
  END LOOP;

  -- Clone sequences (for auto-increment IDs)
  FOR sequence_record IN
    SELECT sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = source_schema
  LOOP
    EXECUTE format(
      'CREATE SEQUENCE IF NOT EXISTS %I.%I',
      target_schema, sequence_record.sequence_name
    );
    
    RAISE NOTICE 'Cloned sequence: %.% -> %.%',
      source_schema, sequence_record.sequence_name,
      target_schema, sequence_record.sequence_name;
  END LOOP;

  RAISE NOTICE 'Schema structure cloned from % to %', source_schema, target_schema;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function: drop_test_schema
-- Purpose: Clean up test schema after test execution
-- Usage: SELECT drop_test_schema('test_1234567890_abc123');
-- Safety: Only allows dropping schemas with 'test_' prefix
-- ============================================================================
CREATE OR REPLACE FUNCTION drop_test_schema(schema_name TEXT)
RETURNS VOID AS $$
BEGIN
  -- Safety check: only allow dropping test schemas
  IF schema_name NOT LIKE 'test_%' THEN
    RAISE EXCEPTION 'Only test schemas (test_*) can be dropped via this function. Got: %', schema_name;
  END IF;

  -- Drop schema and all its contents (CASCADE removes all tables, sequences, etc.)
  EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', schema_name);
  
  RAISE NOTICE 'Dropped test schema: %', schema_name;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail (cleanup failures shouldn't break tests)
    RAISE WARNING 'Failed to drop test schema %: %', schema_name, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function: list_test_schemas
-- Purpose: List all test schemas in the database
-- Usage: SELECT * FROM list_test_schemas();
-- Returns: Array of schema names matching 'test_%' pattern
-- ============================================================================
CREATE OR REPLACE FUNCTION list_test_schemas()
RETURNS TEXT[] AS $$
  SELECT array_agg(schema_name::TEXT ORDER BY schema_name)
  FROM information_schema.schemata
  WHERE schema_name LIKE 'test_%';
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- Function: cleanup_orphaned_test_schemas
-- Purpose: Remove test schemas older than specified age
-- Usage: SELECT cleanup_orphaned_test_schemas(1); -- cleanup schemas older than 1 hour
-- Returns: Array of dropped schema names
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_orphaned_test_schemas(max_age_hours INTEGER DEFAULT 1)
RETURNS TEXT[] AS $$
DECLARE
  schema_name TEXT;
  schema_timestamp BIGINT;
  cutoff_timestamp BIGINT;
  dropped_schemas TEXT[] := '{}';
BEGIN
  -- Calculate cutoff timestamp (current time - max_age_hours)
  cutoff_timestamp := EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 - (max_age_hours * 60 * 60 * 1000);

  -- Iterate through all test schemas
  FOR schema_name IN
    SELECT s.schema_name::TEXT
    FROM information_schema.schemata s
    WHERE s.schema_name LIKE 'test_%'
  LOOP
    -- Extract timestamp from schema name (format: test_<timestamp>_<random>)
    BEGIN
      schema_timestamp := substring(schema_name FROM 'test_(\d+)_')::BIGINT;
      
      -- If schema is older than cutoff, drop it
      IF schema_timestamp < cutoff_timestamp THEN
        EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', schema_name);
        dropped_schemas := array_append(dropped_schemas, schema_name);
        RAISE NOTICE 'Dropped orphaned test schema: % (age: % hours)', 
          schema_name, 
          ROUND((cutoff_timestamp - schema_timestamp)::NUMERIC / (60 * 60 * 1000), 2);
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Could not parse timestamp from schema name: %', schema_name;
        CONTINUE;
    END;
  END LOOP;

  RETURN dropped_schemas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Grant execute permissions (adjust based on your auth setup)
-- ============================================================================
GRANT EXECUTE ON FUNCTION create_test_schema(TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION clone_schema_structure(TEXT, TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION drop_test_schema(TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION list_test_schemas() TO PUBLIC;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_test_schemas(INTEGER) TO PUBLIC;



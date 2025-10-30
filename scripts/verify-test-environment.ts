#!/usr/bin/env bun
/**
 * Test Environment Verification Script
 * 
 * Verifies that the test environment is properly configured.
 * Run after completing TEST_ENVIRONMENT_SETUP.md
 * 
 * Usage: bun run scripts/verify-test-environment.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message: string) {
  console.log('');
  log('='.repeat(60), 'cyan');
  log(message, 'cyan');
  log('='.repeat(60), 'cyan');
  console.log('');
}

// Load env automatically: prefer .env.test, then fallback to .env
(() => {
  const loadedTest = dotenv.config({ path: path.join(process.cwd(), '.env.test') });
  if (loadedTest.error) {
    dotenv.config({ path: path.join(process.cwd(), '.env') });
  }
})();

let allChecksPassed = true;

async function checkEnvFile() {
  header('Check 1: .env.test File');
  
  const envPath = path.join(process.cwd(), '.env.test');
  
  if (!fs.existsSync(envPath)) {
    log('✗ .env.test file not found', 'red');
    log('  Create it with: cp .env.test.template .env.test', 'yellow');
    allChecksPassed = false;
    return;
  }
  
  log('✓ .env.test file exists', 'green');
  
  // Check required variables
  const requiredVars = ['SUPABASE_TEST_URL', 'SUPABASE_TEST_KEY', 'TEST_BASE_URL'];
  const missingVars: string[] = [];
  
  for (const varName of requiredVars) {
    // Allow aliases for convenience
    const value =
      process.env[varName] ||
      (varName === 'SUPABASE_TEST_URL' ? process.env.PUBLIC_SUPABASE_URL : undefined) ||
      (varName === 'SUPABASE_TEST_KEY' ? process.env.PUBLIC_SUPABASE_ANON_KEY : undefined) ||
      (varName === 'TEST_BASE_URL' ? (process.env.TEST_BASE_URL || 'http://localhost:5173') : undefined);
    if (!value) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    log('✗ Missing environment variables:', 'red');
    missingVars.forEach(v => log(`  - ${v}`, 'red'));
    allChecksPassed = false;
  } else {
    log('✓ All required environment variables are set', 'green');
  }
}

async function checkSupabaseConnection() {
  header('Check 2: Supabase Test Connection');
  
  const url = process.env.SUPABASE_TEST_URL || process.env.PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_TEST_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    log('✗ Supabase credentials not configured', 'red');
    allChecksPassed = false;
    return;
  }
  
  log(`Connecting to: ${url}`, 'blue');
  
  try {
    const supabase = createClient(url, key);
    
    // Test connection by calling list_test_schemas function
    const { data, error } = await supabase.rpc('list_test_schemas');
    
    if (error) {
      log('✗ Failed to connect to Supabase', 'red');
      log(`  Error: ${error.message}`, 'red');
      allChecksPassed = false;
      return;
    }
    
    log('✓ Successfully connected to Supabase', 'green');
    log(`  Current test schemas: ${(data as string[])?.length || 0}`, 'blue');
    
  } catch (error: any) {
    log('✗ Connection error', 'red');
    log(`  ${error.message}`, 'red');
    allChecksPassed = false;
  }
}

async function checkSchemaFunctions() {
  header('Check 3: Test Schema Functions');
  
  const url = process.env.SUPABASE_TEST_URL || process.env.PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_TEST_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    log('✗ Skipping (Supabase not configured)', 'yellow');
    return;
  }
  
  const supabase = createClient(url, key);
  
  const requiredFunctions = [
    'create_test_schema',
    'clone_schema_structure',
    'drop_test_schema',
    'list_test_schemas',
    'cleanup_orphaned_test_schemas',
  ];
  
  log('Checking for required functions:', 'blue');
  
  let allFunctionsExist = true;
  
  for (const funcName of requiredFunctions) {
    try {
      // Test each function exists by calling it with invalid args
      const { error } = await supabase.rpc(funcName as any, {} as any);
      
      // If function doesn't exist, we get a different error
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        log(`  ✗ ${funcName}`, 'red');
        allFunctionsExist = false;
      } else {
        log(`  ✓ ${funcName}`, 'green');
      }
    } catch (error) {
      log(`  ✗ ${funcName}`, 'red');
      allFunctionsExist = false;
    }
  }
  
  if (allFunctionsExist) {
    log('✓ All test schema functions are available', 'green');
  } else {
    log('✗ Some functions are missing', 'red');
    log('  Run the SQL migration in Supabase SQL Editor:', 'yellow');
    log('  supabase/migrations/20250000000000_test_schema_functions.sql', 'yellow');
    allChecksPassed = false;
  }
}

async function checkTestDirectories() {
  header('Check 4: Test Directory Structure');
  
  const requiredDirs = [
    'tests/e2e',
    'tests/unit',
    'tests/integration',
    'tests/utils',
    'tests/config',
    'tests/quarantine',
    'tests/e2e/fixtures',
    'tests/e2e/support/page-objects',
    'tests/integration/fixtures',
    'tests/unit/mocks',
  ];
  
  let allDirsExist = true;
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      log(`  ✓ ${dir}`, 'green');
    } else {
      log(`  ✗ ${dir}`, 'red');
      allDirsExist = false;
    }
  }
  
  if (allDirsExist) {
    log('✓ All test directories exist', 'green');
  } else {
    log('✗ Some directories are missing', 'red');
    allChecksPassed = false;
  }
}

async function checkTestFiles() {
  header('Check 5: Key Test Infrastructure Files');
  
  const requiredFiles = [
    'playwright.config.ts',
    'vitest.config.ts',
    'tests/config/timeouts.ts',
    'tests/utils/test-database.ts',
    'tests/utils/test-supabase.ts',
    'tests/utils/factory.ts',
    'tests/utils/cleanup.ts',
    'tests/config/flaky-test-reporter.ts',
    'tests/unit/setup.ts',
    'TESTING.md',
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      log(`  ✓ ${file}`, 'green');
    } else {
      log(`  ✗ ${file}`, 'red');
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    log('✓ All key infrastructure files exist', 'green');
  } else {
    log('✗ Some files are missing', 'red');
    allChecksPassed = false;
  }
}

async function checkGitHubWorkflows() {
  header('Check 6: GitHub Actions Workflows');
  
  const workflowFiles = [
    '.github/workflows/test-unit.yml',
    '.github/workflows/test-e2e.yml',
    '.github/workflows/test-integration.yml',
  ];
  
  let allWorkflowsExist = true;
  
  for (const workflow of workflowFiles) {
    const workflowPath = path.join(process.cwd(), workflow);
    if (fs.existsSync(workflowPath)) {
      log(`  ✓ ${workflow}`, 'green');
    } else {
      log(`  ✗ ${workflow}`, 'red');
      allWorkflowsExist = false;
    }
  }
  
  if (allWorkflowsExist) {
    log('✓ All CI/CD workflows exist', 'green');
  } else {
    log('✗ Some workflows are missing', 'red');
    allChecksPassed = false;
  }
  
  log('', 'reset');
  log('Note: GitHub secrets must be configured manually:', 'yellow');
  log('  - SUPABASE_TEST_URL', 'yellow');
  log('  - SUPABASE_TEST_KEY', 'yellow');
}

async function checkPackageScripts() {
  header('Check 7: Test Scripts in package.json');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log('✗ package.json not found', 'red');
    allChecksPassed = false;
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const scripts = packageJson.scripts || {};
  
  const requiredScripts = [
    'test',
    'test:unit',
    'test:integration',
    'test:e2e',
    'test:coverage',
    'test:watch',
  ];
  
  let allScriptsExist = true;
  
  for (const script of requiredScripts) {
    if (scripts[script]) {
      log(`  ✓ ${script}`, 'green');
    } else {
      log(`  ✗ ${script}`, 'red');
      allScriptsExist = false;
    }
  }
  
  if (allScriptsExist) {
    log('✓ All test scripts are configured', 'green');
  } else {
    log('✗ Some scripts are missing', 'red');
    allChecksPassed = false;
  }
}

async function printSummary() {
  header('Verification Summary');
  
  if (allChecksPassed) {
    log('✓ All checks passed!', 'green');
    log('', 'reset');
    log('Your test environment is fully configured and ready to use.', 'green');
    log('', 'reset');
    log('Next steps:', 'cyan');
    log('  1. Start writing tests as you build features', 'blue');
    log('  2. Run tests locally: bun test', 'blue');
    log('  3. Push to GitHub to trigger CI/CD', 'blue');
    log('', 'reset');
    log('See TESTING.md for developer guide', 'cyan');
  } else {
    log('✗ Some checks failed', 'red');
    log('', 'reset');
    log('Please review the errors above and:', 'yellow');
    log('  1. Complete remaining setup steps in docs/TEST_ENVIRONMENT_SETUP.md', 'yellow');
    log('  2. Run this script again to verify', 'yellow');
    log('', 'reset');
    process.exit(1);
  }
}

// Main execution
async function main() {
  log('', 'reset');
  log('Test Environment Verification', 'cyan');
  log('Running comprehensive checks...', 'cyan');
  
  await checkEnvFile();
  await checkSupabaseConnection();
  await checkSchemaFunctions();
  await checkTestDirectories();
  await checkTestFiles();
  await checkGitHubWorkflows();
  await checkPackageScripts();
  await printSummary();
}

main().catch((error) => {
  log('', 'reset');
  log('✗ Verification failed with error:', 'red');
  log(error.message, 'red');
  process.exit(1);
});


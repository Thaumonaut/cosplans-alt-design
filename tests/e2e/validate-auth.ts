#!/usr/bin/env node
/**
 * Quick validation script to verify E2E auth credentials are loaded correctly
 */

import * as dotenv from 'dotenv';
import { config } from 'dotenv';

// Load .env.test (same as playwright.config.ts does)
dotenv.config({ path: '.env.test' });

console.log('🔍 Validating E2E Auth Credentials from .env.test\n');

// Check all possible variable names
const emailVars = ['TEST_EMAIL', 'EMAIL', 'TEST_USER_EMAIL', 'E2E_EMAIL'];
const passwordVars = ['TEST_PASSWORD', 'PASSWORD', 'TEST_USER_PASSWORD', 'E2E_PASSWORD'];

let foundEmail = '';
let foundPassword = '';
let foundEmailVar = '';
let foundPasswordVar = '';

for (const varName of emailVars) {
  const value = process.env[varName];
  if (value) {
    foundEmail = value;
    foundEmailVar = varName;
    break;
  }
}

for (const varName of passwordVars) {
  const value = process.env[varName];
  if (value) {
    foundPassword = value;
    foundPasswordVar = varName;
    break;
  }
}

console.log('📋 Variable Check Results:');
emailVars.forEach(v => {
  const exists = !!process.env[v];
  console.log(`  ${exists ? '✅' : '❌'} ${v}: ${exists ? 'Set' : 'Not set'}`);
  if (exists && v === foundEmailVar) {
    console.log(`     → Using this one: ${process.env[v]?.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`);
  }
});

console.log('\n📋 Password Variable Check:');
passwordVars.forEach(v => {
  const exists = !!process.env[v];
  console.log(`  ${exists ? '✅' : '❌'} ${v}: ${exists ? 'Set (***)' : 'Not set'}`);
  if (exists && v === foundPasswordVar) {
    console.log(`     → Using this one: *** (length: ${process.env[v]?.length || 0})`);
  }
});

console.log('\n🎯 Auth Helper Will Use:');
if (foundEmail && foundPassword) {
  console.log(`  ✅ Email from: ${foundEmailVar}`);
  console.log(`     ${foundEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`);
  console.log(`  ✅ Password from: ${foundPasswordVar}`);
  console.log(`     *** (${foundPassword.length} characters)`);
  console.log('\n✅ SUCCESS: Credentials found and will be used by loginIfNeeded()');
  process.exit(0);
} else {
  console.log('  ❌ Email: NOT FOUND');
  if (!foundEmail) {
    console.log('     Checked:', emailVars.join(', '));
  }
  console.log('  ❌ Password: NOT FOUND');
  if (!foundPassword) {
    console.log('     Checked:', passwordVars.join(', '));
  }
  console.log('\n❌ FAILURE: No credentials found in .env.test');
  console.log('\nAdd one of these to your .env.test:');
  console.log('  TEST_EMAIL=your-email@example.com');
  console.log('  TEST_PASSWORD=your-password');
  process.exit(1);
}


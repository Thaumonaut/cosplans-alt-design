#!/usr/bin/env bun
/**
 * Script to apply migration directly using SQL execution
 * This attempts multiple methods to execute the SQL
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function applyMigration() {
  const migrationPath = join(import.meta.dir, '..', 'supabase', 'migrations', '20251101150000_create_link_resource_safe.sql')
  const sql = readFileSync(migrationPath, 'utf-8')
  
  console.log('📦 Reading migration file...')
  console.log('🚀 Attempting to apply migration...\n')
  
  // Method 1: Try executing via RPC if exec_sql function exists
  console.log('Method 1: Trying RPC exec_sql...')
  const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { sql } as any)
  
  if (!rpcError) {
    console.log('✅ Migration applied via RPC!')
    return
  }
  
  console.log('   ⚠️  RPC method not available')
  
  // Method 2: Try using Supabase Management API
  console.log('\nMethod 2: Trying Management API...')
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  
  if (projectRef) {
    try {
      // Try to execute via Management API
      const mgmtResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      })
      
      if (mgmtResponse.ok) {
        console.log('✅ Migration applied via Management API!')
        return
      }
    } catch (err) {
      console.log('   ⚠️  Management API method failed')
    }
  }
  
  // Method 3: Try direct REST API with service role
  console.log('\nMethod 3: Trying direct REST API execution...')
  try {
    // PostgREST doesn't support arbitrary SQL, but we can try the REST endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    })
    
    if (response.ok) {
      console.log('✅ Migration applied via REST API!')
      return
    }
  } catch (err) {
    console.log('   ⚠️  REST API method failed')
  }
  
  // All automated methods failed - show instructions
  console.log('\n❌ Automated migration execution not available.')
  console.log('\n📋 Manual Steps Required:\n')
  console.log('1. Open https://supabase.com/dashboard')
  console.log('2. Select your project (zbotvtowbdtvfbnpwnkx)')
  console.log('3. Go to SQL Editor')
  console.log('4. Run the following SQL:\n')
  console.log('─'.repeat(70))
  console.log(sql)
  console.log('─'.repeat(70))
  console.log('\n✅ After running this SQL, resource linking will work!')
  process.exit(1)
}

applyMigration().catch(console.error)


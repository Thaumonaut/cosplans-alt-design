#!/usr/bin/env bun
/**
 * Script to apply the link_resource_safe migration directly to Supabase
 * This creates an RPC function to bypass schema cache issues when linking resources
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗')
  console.error('\n💡 Make sure these are set in your .env file')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('📦 Reading migration file...')
  const migrationPath = join(import.meta.dir, '..', 'supabase', 'migrations', '20251101150000_create_link_resource_safe.sql')
  
  try {
    const sql = readFileSync(migrationPath, 'utf-8')
    
    console.log('🚀 Applying migration to remote database...')
    console.log('\n📝 Executing SQL:')
    console.log('─'.repeat(60))
    console.log(sql.substring(0, 200) + '...')
    console.log('─'.repeat(60))
    
    // Try to execute via Supabase Management API or direct connection
    // Since PostgREST doesn't support executing arbitrary SQL, we need to use a different approach
    
    console.log('⚠️  Direct SQL execution via PostgREST is not supported.')
    console.log('📝 Attempting to verify if we can execute via alternative method...\n')
    
    // Try to verify if function exists by attempting to call it
    console.log('🔍 Checking if function already exists...')
    const { data: testCall, error: testError } = await supabase.rpc('link_resource_safe', {
      p_project_id: '00000000-0000-0000-0000-000000000000',
      p_resource_id: '00000000-0000-0000-0000-000000000000',
      p_quantity: 1,
      p_status: 'needed'
    } as any)
    
    if (testError) {
      if (testError.message?.includes('function') || testError.code?.includes('42883')) {
        console.log('❌ Function does not exist yet.')
        console.log('\n📋 To apply this migration, you have two options:\n')
        console.log('Option 1: Use Supabase Dashboard (Recommended)')
        console.log('  1. Go to https://supabase.com/dashboard')
        console.log('  2. Select your project')
        console.log('  3. Navigate to SQL Editor')
        console.log('  4. Copy and paste the SQL below\n')
        console.log('─'.repeat(60))
        console.log(sql)
        console.log('─'.repeat(60))
        console.log('\nOption 2: Use Supabase CLI')
        console.log('  Run: supabase db push --linked')
        console.log('\nAfter applying, the link_resource_safe() function will be available')
        console.log('and resource linking will work even if the schema cache is stale.\n')
        process.exit(1)
      } else if (testError.message?.includes('Project not found') || testError.message?.includes('Not authenticated')) {
        console.log('✅ Function exists! (Test call failed as expected with invalid params)')
        console.log('✅ Migration already applied successfully!')
        return
      }
    } else {
      console.log('✅ Function exists and is callable!')
      console.log('✅ Migration already applied!')
      return
    }
    
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.error('❌ Migration file not found:', migrationPath)
      process.exit(1)
    }
    
    console.error('❌ Migration failed:', err.message)
    console.error('\n📝 Please run this SQL manually in Supabase Dashboard → SQL Editor:')
    
    try {
      const sql = readFileSync(migrationPath, 'utf-8')
      console.error('\n' + sql)
    } catch {
      console.error('\n(Could not read migration file)')
    }
    
    process.exit(1)
  }
}

applyMigration().catch((err) => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})


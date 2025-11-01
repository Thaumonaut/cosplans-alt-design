#!/usr/bin/env bun
/**
 * Script to apply the primary_image_index migration directly to Supabase
 * This bypasses the migration history table issues
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
  const migrationPath = join(import.meta.dir, '..', 'supabase', 'migrations', '20250000000017_add_primary_image_index.sql')
  const sql = readFileSync(migrationPath, 'utf-8')
  
  console.log('🚀 Applying migration to remote database...')
  console.log('\nSQL to execute:')
  console.log('─'.repeat(60))
  console.log(sql)
  console.log('─'.repeat(60))
  
  try {
    // Execute SQL via RPC (if available) or use REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      // If RPC doesn't exist, try direct SQL execution via PostgREST
      // Fallback: try via database connection string if we have it
      console.log('⚠️  RPC method failed, trying alternative approach...')
      
      // Check if column already exists
      const { data: checkData, error: checkError } = await supabase
        .from('ideas')
        .select('primary_image_index')
        .limit(0)
      
      if (!checkError && checkData !== null) {
        console.log('✅ Column already exists! Migration may have already been applied.')
        return
      }
      
      // Column doesn't exist - need to apply via SQL Editor or direct connection
      console.error('❌ Unable to execute SQL automatically.')
      console.error('   Error:', error.message)
      console.error('\n📝 Please run this SQL in Supabase Dashboard → SQL Editor:')
      console.error('\n' + sql)
      process.exit(1)
    }
    
    console.log('✅ Migration applied successfully!')
    
    // Verify column exists
    console.log('\n🔍 Verifying column exists...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('ideas')
      .select('primary_image_index')
      .limit(1)
    
    if (verifyError) {
      console.error('⚠️  Warning: Could not verify column (this might be a schema cache issue)')
      console.error('   Error:', verifyError.message)
      console.error('\n💡 Try refreshing the schema cache:')
      console.error('   Run in SQL Editor: SELECT pg_notify(\'pgrst\', \'reload schema\');')
    } else {
      console.log('✅ Column verified successfully!')
    }
    
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message)
    console.error('\n📝 Please run this SQL manually in Supabase Dashboard → SQL Editor:')
    console.error('\n' + sql)
    process.exit(1)
  }
}

applyMigration()


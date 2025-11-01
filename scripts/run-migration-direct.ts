#!/usr/bin/env bun
import { readFileSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL?.replace('/rest/v1', '')
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing env vars')
  process.exit(1)
}

const sql = readFileSync(
  join(import.meta.dir, '..', 'supabase', 'migrations', '20250000000017_add_primary_image_index.sql'),
  'utf-8'
)

// Use Management API to execute SQL
const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ sql }),
})

if (!response.ok) {
  // Try direct psql approach via connection string
  console.log('Trying alternative method...')
  
  // Get project connection details
  const projectId = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  if (projectId) {
    console.log(`\n📝 Please run this SQL in Supabase Dashboard → SQL Editor for project: ${projectId}`)
    console.log('\n' + sql)
    
    // Also try via REST API with a simpler approach
    console.log('\n🔍 Attempting to check if column exists...')
    try {
      const testClient = await import('@supabase/supabase-js')
      const { createClient } = testClient.default
      const client = createClient(SUPABASE_URL + '/rest/v1', SUPABASE_SERVICE_KEY)
      const { error } = await client.from('ideas').select('primary_image_index').limit(0)
      
      if (error && error.message.includes('primary_image_index')) {
        console.log('✅ Confirmed: Column does NOT exist - migration is needed')
      } else if (!error) {
        console.log('✅ Column already exists!')
      }
    } catch (e) {
      // Ignore
    }
  }
  process.exit(1)
}

const result = await response.json()
console.log('✅ Migration applied successfully!')
console.log(result)


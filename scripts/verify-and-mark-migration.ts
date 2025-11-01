#!/usr/bin/env bun
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🔍 Verifying primary_image_index column exists...')

try {
  const { data, error } = await supabase.from('ideas').select('primary_image_index').limit(1)
  
  if (error && error.message.includes('primary_image_index')) {
    console.error('❌ Column does NOT exist:', error.message)
    console.error('\n📝 Please run this SQL in Supabase Dashboard → SQL Editor:')
    console.error(`
ALTER TABLE public.ideas 
  ADD COLUMN IF NOT EXISTS primary_image_index INTEGER DEFAULT 0 CHECK (primary_image_index >= 0);

COMMENT ON COLUMN public.ideas.primary_image_index IS 'Index of the primary/header image in the images array (0-based). Defaults to 0 (first image).';
    `)
    process.exit(1)
  } else if (error) {
    console.error('⚠️  Error checking column:', error.message)
    process.exit(1)
  } else {
    console.log('✅ Column EXISTS and is accessible!')
    
    // Now mark migration as applied if we have service key
    if (SUPABASE_SERVICE_KEY) {
      console.log('\n📝 Note: Migration 20250000000017 needs to be marked as applied.')
      console.log('   Run this SQL in Supabase Dashboard to update migration history:')
      console.log(`
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES ('20250000000017', 'add_primary_image_index', '{}')
ON CONFLICT (version) DO NOTHING;
      `)
    }
  }
} catch (err: any) {
  console.error('❌ Error:', err.message)
  process.exit(1)
}


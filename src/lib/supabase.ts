import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/supabase';

// Validate environment variables
// Note: In SvelteKit/Vite, PUBLIC_* variables from .env are automatically available via import.meta.env
// If these are empty, ensure:
// 1. Your .env file exists in the project root
// 2. Variables are prefixed with PUBLIC_ (e.g., PUBLIC_SUPABASE_URL)
// 3. The dev server has been restarted after adding/changing .env variables
if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
  const errorMsg = [
    'Missing Supabase environment variables.',
    '',
    'Please ensure your .env file contains:',
    '  PUBLIC_SUPABASE_URL=https://your-project.supabase.co',
    '  PUBLIC_SUPABASE_ANON_KEY=your-anon-key',
    '',
    'Current status:',
    `  PUBLIC_SUPABASE_URL: ${PUBLIC_SUPABASE_URL ? '✓ set' : '✗ missing'}`,
    `  PUBLIC_SUPABASE_ANON_KEY: ${PUBLIC_SUPABASE_ANON_KEY ? '✓ set' : '✗ missing'}`,
    '',
    'If variables are set in .env but still missing:',
    '  1. Restart your dev server (stop and run "bun dev" again)',
    '  2. Verify the .env file is in the project root directory',
    '  3. Ensure variables are prefixed with PUBLIC_'
  ].join('\n');
  
  throw new Error(errorMsg);
}

// Create Supabase browser client with SSR support
// This properly handles PKCE flow and cookies for OAuth
export const supabase: SupabaseClient<Database> = createBrowserClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);

// Helper function to handle Supabase errors
export function handleSupabaseError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const { message } = error as { message?: string };
    if (message) {
      return message;
    }
  }

  return 'An unexpected error occurred';
}

// Type exports for convenience
export type { Database } from '$lib/types/supabase';
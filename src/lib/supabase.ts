import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
// Read PUBLIC_ env from Vite/SvelteKit or fallback to process.env for tests
const VITE_ENV: any = (import.meta as any)?.env || {};
const PUBLIC_SUPABASE_URL = VITE_ENV.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const PUBLIC_SUPABASE_ANON_KEY = VITE_ENV.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
import type { Database } from '$lib/types/supabase';

// Validate environment variables
if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
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
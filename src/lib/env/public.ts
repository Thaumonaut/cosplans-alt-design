// Public environment variables wrapper
// Runtime: Uses $env/static/public (proper SvelteKit way)
// Tests: This entire file is aliased to tests/mocks/env-public.ts in vitest.config.ts

// Dynamic import to avoid resolution issues in tests
// In runtime, this will use $env/static/public
// In tests, the file-level alias intercepts this entire file
let PUBLIC_SUPABASE_URL_VAL: string = '';
let PUBLIC_SUPABASE_ANON_KEY_VAL: string = '';

// Check if we're in a test environment
const isTest = typeof process !== 'undefined' && (process.env.VITEST || process.env.NODE_ENV === 'test');

if (!isTest) {
  // Runtime: Use $env/static/public (proper SvelteKit way)
  // Use dynamic import to avoid static analysis issues
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - $env/static/public is a SvelteKit internal module
    const envModule = await import('$env/static/public');
    PUBLIC_SUPABASE_URL_VAL = envModule.PUBLIC_SUPABASE_URL || '';
    PUBLIC_SUPABASE_ANON_KEY_VAL = envModule.PUBLIC_SUPABASE_ANON_KEY || '';
  } catch (e) {
    // Fallback to import.meta.env if $env/static/public fails
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    PUBLIC_SUPABASE_URL_VAL = (import.meta.env?.PUBLIC_SUPABASE_URL as string) || '';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    PUBLIC_SUPABASE_ANON_KEY_VAL = (import.meta.env?.PUBLIC_SUPABASE_ANON_KEY as string) || '';
  }
} else {
  // Test environment: Use import.meta.env (populated by Vite in tests)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  PUBLIC_SUPABASE_URL_VAL = (import.meta.env?.PUBLIC_SUPABASE_URL as string) || '';
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  PUBLIC_SUPABASE_ANON_KEY_VAL = (import.meta.env?.PUBLIC_SUPABASE_ANON_KEY as string) || '';
}

export const PUBLIC_SUPABASE_URL = PUBLIC_SUPABASE_URL_VAL;
export const PUBLIC_SUPABASE_ANON_KEY = PUBLIC_SUPABASE_ANON_KEY_VAL;

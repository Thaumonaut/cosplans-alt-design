import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  
  // Try to get redirect destination from multiple sources:
  // 1. Query parameter 'next' (if OAuth provider preserved it)
  // 2. State parameter from Supabase (if available)
  // Note: localStorage will be checked client-side (more reliable)
  const nextFromQuery = url.searchParams.get('next');
  const nextFromState = url.searchParams.get('state');
  let next = nextFromQuery || nextFromState || null;

  console.log('[OAuth Callback Server] Query params:', {
    code: code ? 'present' : 'missing',
    next: nextFromQuery,
    state: nextFromState,
    allParams: Object.fromEntries(url.searchParams.entries())
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If we have a redirect path from query params, pass it to client
      // But client-side will prioritize localStorage, which is more reliable
      const redirectPath = next && next.startsWith('/') ? next : (next ? `/${next}` : null);
      
      console.log('[OAuth Callback Server] Auth successful, redirect path:', redirectPath || 'null (will check localStorage)');
      
      // Return a page that will use client-side code to check localStorage
      // and redirect appropriately (handles case where query params were stripped)
      return {
        redirectTo: redirectPath,
      };
    } else {
      console.error('[OAuth Callback Server] Auth error:', error.message);
    }
  }

  // Return to login page if there was an error, but preserve redirectTo if it exists
  if (next) {
    console.log('[OAuth Callback Server] Redirecting to login with preserved redirectTo:', next);
    throw redirect(303, `/login?redirectTo=${encodeURIComponent(next)}`);
  }
  throw redirect(303, '/login');
};
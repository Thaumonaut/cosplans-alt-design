import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  
  // Try to get redirect destination from multiple sources:
  // 1. Query parameter (if OAuth provider preserved it)
  // 2. State parameter from Supabase (if available)
  let next = url.searchParams.get('next') || url.searchParams.get('state') || '/dashboard';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure we redirect to the correct origin (handle relative paths)
      const redirectPath = next.startsWith('/') ? next : `/${next}`;
      
      // Return a page that will use client-side code to check localStorage
      // and redirect appropriately (handles case where query params were stripped)
      return {
        redirectTo: redirectPath,
      };
    }
  }

  // Return to login page if there was an error, but preserve redirectTo if it exists
  const redirectTo = next;
  if (redirectTo && redirectTo !== '/dashboard') {
    throw redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  throw redirect(303, '/login');
};
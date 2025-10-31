import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure we redirect to the correct origin (handle relative paths)
      const redirectPath = next.startsWith('/') ? next : `/${next}`
      throw redirect(303, redirectPath);
    }
  }

  // Return to login page if there was an error, but preserve redirectTo if it exists
  const redirectTo = url.searchParams.get('next')
  if (redirectTo) {
    throw redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  throw redirect(303, '/login');
};
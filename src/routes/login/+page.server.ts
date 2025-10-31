import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Redirect authenticated users away from login page
export const load: PageServerLoad = async ({ locals: { safeGetSession }, url }) => {
  const { session, user } = await safeGetSession();

  // If user is already authenticated, redirect to dashboard
  if (session && user) {
    const redirectTo = url.searchParams.get('redirectTo');
    if (redirectTo) {
      throw redirect(303, decodeURIComponent(redirectTo));
    }
    throw redirect(303, '/dashboard');
  }

  return {};
};


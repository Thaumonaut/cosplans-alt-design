import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, url }) => {
  const { session, user } = await safeGetSession();

  // Require authentication for all routes in (auth) group
  if (!session || !user) {
    // Preserve the intended destination so user can be redirected back after login
    const redirectTo = encodeURIComponent(url.pathname + url.search);
    throw redirect(302, `/login?redirectTo=${redirectTo}`);
  }

  return {
    session,
    user,
  };
};
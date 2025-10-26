import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session, user } = await safeGetSession();

  // Require authentication for all routes in (auth) group
  if (!session || !user) {
    throw redirect(302, '/login');
  }

  return {
    session,
    user,
  };
};
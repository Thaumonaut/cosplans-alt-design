import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Redirect /teams to /settings/team since team management is handled in settings
export const load: PageServerLoad = async () => {
  throw redirect(301, '/settings/team');
};


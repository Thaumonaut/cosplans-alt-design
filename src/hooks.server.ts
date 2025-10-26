/**
 * SvelteKit server hooks
 * Sets up Supabase authentication and authorization for all requests
 */

import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase: Handle = async ({ event, resolve }) => {
  /**
   * Creates a Supabase client specific to this server request.
   * The Supabase client gets the Auth token from the request cookies.
   */
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' });
        });
      },
    },
  });

  /**
   * Securely gets the user by validating the JWT via getUser().
   * We don't use getSession() as it doesn't validate the JWT.
   * For server-side auth, the validated user object is sufficient.
   * 
   * PERFORMANCE: This function implements request-scoped caching.
   * The first call validates the JWT, subsequent calls return cached data.
   * This significantly reduces authentication overhead on pages with multiple
   * server actions or load functions.
   */
  let cachedSession: { session: any; user: any } | null = null;
  let sessionFetched = false;

  event.locals.safeGetSession = async () => {
    // Return cached result if already fetched in this request
    if (sessionFetched) {
      return cachedSession!;
    }

    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser();
    
    if (error || !user) {
      // JWT validation failed or no user
      cachedSession = { session: null, user: null };
    } else {
      // Return user with a minimal session object
      // The user object is validated and secure
      cachedSession = { 
        session: { user }, // Minimal session with validated user
        user 
      };
    }

    sessionFetched = true;
    return cachedSession;
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Supabase libraries use the `content-range` and `x-supabase-api-version`
       * headers, so we need to tell SvelteKit to pass it through.
       */
      return name === 'content-range' || name === 'x-supabase-api-version';
    },
  });
};

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  // Protected routes that require authentication
  // These should match the routes inside the (auth) group
  const protectedRoutes = [
    '/dashboard', 
    '/timeline', 
    '/progress', 
    '/portfolio', 
    '/budget', 
    '/teams',
    '/characters',
    '/outfits',
    '/props',
    '/equipment',
    '/accessories',
    '/materials',
    '/photoshoots',
    '/events',
    '/settings',
    '/planning',
    '/tasks',
    '/calendar',
    '/marketplace',
    '/messages',
    '/profile',
    '/ideas',
    '/archived',
    '/in-progress',
    '/post-production',
    '/tools'
  ];
  
  const isProtectedRoute = protectedRoutes.some(route => event.url.pathname.startsWith(route));

  if (isProtectedRoute && !session) {
    // Redirect to login with the current path as redirectTo parameter
    const redirectTo = encodeURIComponent(event.url.pathname + event.url.search);
    throw redirect(303, `/login?redirectTo=${redirectTo}`);
  }

  return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
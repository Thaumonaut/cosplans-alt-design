import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/supabase';

export function createSupabaseLoadClient(fetch: typeof globalThis.fetch) {
  if (isBrowser()) {
    // Create a client for browser usage with proper cookie handling
    return createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return document.cookie.split(';').map(c => {
            const [name, ...rest] = c.trim().split('=');
            const value = rest.join('=');
            return { name, value };
          }).filter(c => c.name);
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieString = `${name}=${value}`;
            if (options?.maxAge) cookieString += `; Max-Age=${options.maxAge}`;
            if (options?.domain) cookieString += `; Domain=${options.domain}`;
            if (options?.path) cookieString += `; Path=${options.path}`;
            if (options?.secure) cookieString += '; Secure';
            if (options?.httpOnly) cookieString += '; HttpOnly';
            if (options?.sameSite) cookieString += `; SameSite=${options.sameSite}`;
            document.cookie = cookieString;
          });
        },
      },
    });
  }

  // For server-side rendering, return a client without cookies
  // The server-side client is handled in hooks.server.ts
  return createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      fetch,
    },
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No-op for server-side
      },
    },
  });
}
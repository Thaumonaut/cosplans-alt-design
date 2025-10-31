import { createSupabaseLoadClient } from '$lib/auth/supabase-client';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends, url }) => {
  depends('supabase:auth');

  // Skip Supabase initialization for public routes to avoid errors
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/auth'];
  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route));

  // For public routes, return minimal data
  if (isPublicRoute) {
    try {
      const supabase = createSupabaseLoadClient(fetch);
      const {
        data: { session },
      } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));

      return {
        supabase,
        session: session || null,
        title: 'Cosplans - Cosplay Project Tracker',
        description: 'Track your cosplay projects from inspiration to completion'
      };
    } catch (err) {
      // If Supabase fails on public routes, still allow page to render
      console.warn('Supabase initialization failed on public route:', err);
      return {
        supabase: null,
        session: null,
        title: 'Cosplans - Cosplay Project Tracker',
        description: 'Track your cosplay projects from inspiration to completion'
      };
    }
  }

  try {
    const supabase = createSupabaseLoadClient(fetch);

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // If there's an error getting the session, continue without it
    // This allows public pages like login to render correctly
    if (error) {
      console.warn('Failed to get session in layout:', error);
    }

    return {
      supabase,
      session: session || null,
      title: 'Cosplans - Cosplay Project Tracker',
      description: 'Track your cosplay projects from inspiration to completion'
    };
  } catch (err) {
    // Fallback if Supabase client creation fails
    console.error('Failed to create Supabase client in layout:', err);
    return {
      supabase: null,
      session: null,
      title: 'Cosplans - Cosplay Project Tracker',
      description: 'Track your cosplay projects from inspiration to completion'
    };
  }
};
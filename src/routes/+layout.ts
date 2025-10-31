import { createSupabaseLoadClient } from '$lib/auth/supabase-client';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth');

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
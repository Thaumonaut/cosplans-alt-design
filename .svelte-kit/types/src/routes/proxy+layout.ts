// @ts-nocheck
import { createSupabaseLoadClient } from '$lib/auth/supabase-client';
import type { LayoutLoad } from './$types';

export const load = async ({ fetch, data, depends }: Parameters<LayoutLoad>[0]) => {
  depends('supabase:auth');

  const supabase = createSupabaseLoadClient(fetch);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    supabase,
    session,
    title: 'Cosplans - Cosplay Project Tracker',
    description: 'Track your cosplay projects from inspiration to completion'
  };
};
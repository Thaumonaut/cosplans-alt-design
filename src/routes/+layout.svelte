<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { invalidate } from "$app/navigation";
  import { authActions } from "$lib/stores/auth-store.js";
  import type { LayoutData } from "./$types";

  let { data }: { data: LayoutData } = $props();

  const { supabase, session } = data;

  // Initialize auth state in stores if we have session data
  $effect(() => {
    if (session?.user) {
      authActions.initialize(session.user, session);
    } else {
      authActions.clear();
    }
  });

  onMount(() => {
    // Only set up auth listener if supabase client is available and in browser
    if (typeof window === 'undefined') return;
    if (!supabase) {
      console.warn('Supabase client not available in layout');
      return;
    }

    // Set up Supabase auth state listener for the entire app
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const result = supabase.auth.onAuthStateChange((event, _session) => {
        if (_session?.expires_at !== session?.expires_at) {
          invalidate("supabase:auth");
        }
      });
      subscription = result.data.subscription;
    } catch (err) {
      console.error('Failed to set up auth state listener:', err);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  });
</script>

<svelte:head>
  <title>Cosplans - Cosplay Project Tracker</title>
  <meta
    name="description"
    content="Track your cosplay projects from inspiration to completion"
  />
  <meta name="generator" content="SvelteKit" />
</svelte:head>

<!-- Root layout - just renders the slot for public and protected routes -->
<div class="font-sans antialiased">
  <slot />
</div>

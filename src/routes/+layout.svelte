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
    // Set up Supabase auth state listener for the entire app
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate("supabase:auth");
      }
    });

    return () => subscription.unsubscribe();
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

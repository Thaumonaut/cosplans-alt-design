<script lang="ts">
  import '../../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { preloadData, invalidate, goto } from '$app/navigation';
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import PageHeader from '$lib/components/page-header.svelte';
  import { initializeStores } from '$lib/stores/init.js';
  import { CRITICAL_ROUTES, CRITICAL_RESOURCES } from '$lib/config/preload.js';
  import { preloadRoute } from '$lib/utils/performance.js';
  import { authActions } from '$lib/stores/auth-store.js';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  $: ({ supabase, session, user } = data);
  
  // Initialize auth state in stores
  $: if (user && session) {
    authActions.initialize(user, session);
  }

  // Client-side redirect to login if no session (shouldn't happen due to server-side guard, but good fallback)
  $: if (typeof window !== 'undefined' && !session) {
    goto('/login');
  }
  
  // Initialize all stores on app startup
  onMount(() => {
    initializeStores();
    
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'SIGNED_OUT') {
        // User signed out, redirect to login
        goto('/login');
      } else if (_session?.expires_at !== session?.expires_at) {
        // Session changed, invalidate and reload
        invalidate('supabase:auth');
      }
    });
    
    // Preload critical routes for better navigation performance
    CRITICAL_ROUTES.forEach(route => {
      if (route !== $page.route.id) {
        preloadRoute(route);
        // Use SvelteKit's preloadData for even better performance
        preloadData(route).catch(() => {
          // Silently fail if preloading fails
        });
      }
    });
    
    // Preload critical resources
    CRITICAL_RESOURCES.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = resource.endsWith('.svg') ? 'image' : 'image';
      link.href = resource;
      document.head.appendChild(link);
    });

    return () => subscription.unsubscribe();
  });
</script>

<svelte:head>
  <title>Cosplans - Cosplay Project Tracker</title>
  <meta name="description" content="Track your cosplay projects from inspiration to completion" />
  <meta name="generator" content="SvelteKit" />
</svelte:head>

<!-- Authenticated app layout with sidebar and header -->
<div class="font-sans antialiased">
  <div class="flex min-h-screen w-full">
    <AppSidebar />
    <main class="max-w-full flex-1 overflow-x-hidden">
      <PageHeader />
      <slot />
    </main>
  </div>
</div>
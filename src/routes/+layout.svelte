<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { preloadData } from '$app/navigation';
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import PageHeader from '$lib/components/page-header.svelte';
  import { initializeStores } from '$lib/stores/init.js';
  import { CRITICAL_ROUTES, CRITICAL_RESOURCES } from '$lib/config/preload.js';
  import { preloadRoute } from '$lib/utils/performance.js';
  
  // Initialize all stores on app startup
  onMount(() => {
    initializeStores();
    
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
  });

  // Check if current route is the landing page
  $: isLandingPage = $page.route.id === '/';
</script>

<svelte:head>
  <title>Cosplans - Cosplay Project Tracker</title>
  <meta name="description" content="Track your cosplay projects from inspiration to completion" />
  <meta name="generator" content="SvelteKit" />
</svelte:head>

<div class="font-sans antialiased">
  {#if isLandingPage}
    <!-- Landing page without sidebar/header -->
    <slot />
  {:else}
    <!-- App layout with sidebar and header -->
    <div class="flex min-h-screen w-full">
      <AppSidebar />
      <main class="max-w-full flex-1 overflow-x-hidden">
        <PageHeader />
        <slot />
      </main>
    </div>
  {/if}
</div>
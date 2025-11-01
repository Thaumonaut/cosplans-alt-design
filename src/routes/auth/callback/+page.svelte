<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let { data } = $props();

  onMount(() => {
    // Check multiple sources for redirect destination (in order of preference):
    // 1. localStorage (most reliable - stored before OAuth redirect, survives query param stripping)
    // 2. Server-side data (from query params that were preserved)
    // 3. Default to dashboard
    
    let redirectPath = '/dashboard';
    
    // Prioritize localStorage first - it contains the original destination
    // OAuth providers may strip query parameters, so this is the most reliable source
    try {
      const storedPath = localStorage.getItem('oauth_redirect_to');
      if (storedPath) {
        redirectPath = storedPath;
        // Clear it after use
        localStorage.removeItem('oauth_redirect_to');
        console.log('[OAuth Callback] Using redirect from localStorage:', redirectPath);
      } else if (data?.redirectTo && data.redirectTo !== '/dashboard') {
        // Only use server-side data if localStorage doesn't have it and it's not the default
        redirectPath = data.redirectTo;
        console.log('[OAuth Callback] Using redirect from server data:', redirectPath);
      } else {
        console.log('[OAuth Callback] No stored redirect, using default:', redirectPath);
      }
    } catch (e) {
      console.warn('[OAuth Callback] Failed to read localStorage, falling back to server data:', e);
      // Fallback to server data if localStorage fails
      if (data?.redirectTo) {
        redirectPath = data.redirectTo;
      }
    }

    // Small delay to ensure auth state is updated
    setTimeout(() => {
      // Redirect to the intended destination
      goto(redirectPath, { invalidateAll: true });
    }, 100);
  });
</script>

<div class="flex items-center justify-center min-h-screen">
  <div class="text-center">
    <div class="spinner" aria-label="Loading"></div>
    <p class="mt-4 text-gray-600">Completing sign in...</p>
  </div>
</div>

<style>
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #4285F4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>


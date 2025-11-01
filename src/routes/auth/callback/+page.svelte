<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let { data } = $props();

  onMount(() => {
    // Check multiple sources for redirect destination (in order of preference):
    // 1. Server-side data (from query params that were preserved)
    // 2. localStorage (stored before OAuth redirect)
    // 3. Default to dashboard
    
    let redirectPath = '/dashboard';
    
    if (data?.redirectTo) {
      redirectPath = data.redirectTo;
    } else {
      // Check localStorage as fallback (OAuth providers may strip query params)
      try {
        const storedPath = localStorage.getItem('oauth_redirect_to');
        if (storedPath) {
          redirectPath = storedPath;
          // Clear it after use
          localStorage.removeItem('oauth_redirect_to');
        }
      } catch (e) {
        console.warn('Failed to read OAuth redirect from localStorage:', e);
      }
    }

    // Redirect to the intended destination
    goto(redirectPath, { invalidateAll: true });
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


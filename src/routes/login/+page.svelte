<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authService } from '$lib/auth/auth-service';
  import OAuthButtons from '$lib/components/auth/OAuthButtons.svelte';

  let isLoading = false;
  let showPassword = false;
  let email = '';
  let password = '';
  let rememberMe = false;
  let error = '';

  const isFormValid = $derived(email && password);

  const togglePasswordVisibility = () => {
    showPassword = !showPassword;
  };

  async function handleLogin() {
    if (!isFormValid) {
      error = 'Please fill in all fields';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const result = await authService.signIn({ email, password });
      
      if (result.error) {
        error = getAuthErrorMessage(result.error);
      } else {
        // Redirect to intended page or dashboard
        const redirectTo = $page.url.searchParams.get('redirectTo');
        if (redirectTo) {
          await goto(decodeURIComponent(redirectTo));
        } else {
          await goto('/dashboard');
        }
      }
    } catch (err) {
      error = 'An unexpected error occurred';
    } finally {
      isLoading = false;
    }
  }

  const getAuthErrorMessage = (errorMessage: string) => {
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password';
    }

    if (errorMessage.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link';
    }

    if (errorMessage.includes('Too many requests')) {
      return 'Too many attempts. Please try again later';
    }

    return 'Login failed. Please try again';
  };
</script>

<svelte:head>
  <title>Sign In - Cosplans</title>
  <meta name="description" content="Sign in to your Cosplans account" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Access your photoshoots and team collaboration
      </p>
    </div>

    <form class="mt-8 space-y-6" on:submit|preventDefault={handleLogin}>
      {#if error}
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="john@example.com"
            bind:value={email}
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div class="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autocomplete="current-password"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
              placeholder="••••••••"
              bind:value={password}
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              on:click={togglePasswordVisibility}
            >
              {#if showPassword}
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {:else}
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              {/if}
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              bind:checked={rememberMe}
            />
            <label for="rememberMe" class="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isLoading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          {:else}
            Sign in
          {/if}
        </button>
      </div>

      <!-- OAuth Social Login -->
      <OAuthButtons mode="login" />

      <div class="text-center">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <a href="/signup" class="font-medium text-blue-600 hover:text-blue-500">
            Create one
          </a>
        </p>
      </div>
    </form>
  </div>
</div>
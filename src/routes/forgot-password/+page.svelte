<script lang="ts">
  import { authService } from '$lib/auth/auth-service';

  let isLoading = false;
  let email = '';
  let emailSent = false;
  let error = '';

  const isFormValid = $derived(email && email.includes('@'));

  const handleSubmit = async () => {
    if (!isFormValid) return;

    isLoading = true;
    error = '';

    try {
      const result = await authService.resetPassword(email);
      
      if (result.error) {
        error = result.error;
      } else {
        emailSent = true;
      }
    } catch (err) {
      error = 'Password reset failed. Please try again';
    } finally {
      isLoading = false;
    }
  };
</script>

<svelte:head>
  <title>Forgot Password - Cosplans</title>
  <meta name="description" content="Reset your Cosplans password" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Forgot your password?
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter your email address and we'll send you a link to reset your password
      </p>
    </div>

    {#if emailSent}
      <div class="bg-green-50 border border-green-200 rounded-md p-4">
        <div class="flex">
          <div class="ml-3">
            <p class="text-sm text-green-800">
              Password reset email sent! Please check your inbox and follow the instructions to reset your password.
            </p>
          </div>
        </div>
      </div>

      <div class="text-center">
        <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
          Back to sign in
        </a>
      </div>
    {:else}
      <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
        {#if error}
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        {/if}

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
              Sending...
            {:else}
              Send reset link
            {/if}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Remember your password?
            <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </form>
    {/if}
  </div>
</div>
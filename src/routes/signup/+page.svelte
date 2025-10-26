<script lang="ts">
  import { authService } from '$lib/auth/auth-service';
  import OAuthButtons from '$lib/components/auth/OAuthButtons.svelte';

  let isLoading = false;
  let showPassword = false;
  let showConfirmPassword = false;

  // Form data
  let email = '';
  let password = '';
  let confirmPassword = '';
  let firstName = '';
  let lastName = '';
  let error = '';
  let success = '';

  // Debounced password for validation (only update every 300ms)
  let debouncedPassword = '';
  let debounceTimer: ReturnType<typeof setTimeout>;
  
  $: {
    // Debounce password validation
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debouncedPassword = password;
    }, 300);
  }

  // Password strength validation (using debounced password)
  $: hasMinLength = debouncedPassword.length >= 8;
  $: hasLowercase = /[a-z]/.test(debouncedPassword);
  $: hasUppercase = /[A-Z]/.test(debouncedPassword);
  $: hasNumber = /[0-9]/.test(debouncedPassword);
  $: hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(debouncedPassword);
  $: isPasswordValid = hasMinLength && hasLowercase && hasUppercase && hasNumber && hasSpecial;
  $: passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  
  // Calculate password strength (0-5 requirements met)
  $: requirementsMet = [hasMinLength, hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  $: strengthPercentage = (requirementsMet / 5) * 100;
  $: strengthColor = requirementsMet <= 2 ? 'bg-red-500' : requirementsMet <= 3 ? 'bg-yellow-500' : requirementsMet === 4 ? 'bg-blue-500' : 'bg-green-500';
  $: strengthLabel = requirementsMet <= 2 ? 'Weak' : requirementsMet <= 3 ? 'Fair' : requirementsMet === 4 ? 'Good' : 'Strong';
  
  // Form validation
  $: isFormValid = email && firstName && lastName && isPasswordValid && passwordsMatch;

  const togglePasswordVisibility = (field: 'password' | 'confirm') => {
    if (field === 'password') {
      showPassword = !showPassword;
    } else {
      showConfirmPassword = !showConfirmPassword;
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    isLoading = true;
    error = '';
    success = '';

    try {
      const result = await authService.signUp({
        email,
        password,
        firstName,
        lastName,
      });
      
      if (result.error) {
        error = getAuthErrorMessage(result.error);
      } else {
        success = 'Account created successfully! Please check your email for verification.';
        // Clear form
        email = '';
        password = '';
        confirmPassword = '';
        firstName = '';
        lastName = '';
      }
    } catch (err) {
      error = 'Registration failed. Please try again';
    } finally {
      isLoading = false;
    }
  };

  const getAuthErrorMessage = (errorMessage: string) => {
    if (errorMessage.includes('User already registered')) {
      return 'An account with this email already exists';
    }

    if (errorMessage.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long';
    }

    return 'Registration failed. Please try again';
  };
</script>

<svelte:head>
  <title>Create Account - Cosplans</title>
  <meta name="description" content="Create your Cosplans account to start planning your photoshoots" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Start planning your photoshoots with Cosplans
      </p>
    </div>

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

      {#if success}
        <div class="bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm text-green-800">
                {success}
              </p>
            </div>
          </div>
        </div>
      {/if}

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="John"
              bind:value={firstName}
            />
          </div>

          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Doe"
              bind:value={lastName}
            />
          </div>
        </div>

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
              autocomplete="new-password"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
              placeholder="••••••••"
              bind:value={password}
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              on:click={() => togglePasswordVisibility('password')}
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

          {#if password.length > 0}
            <div class="mt-3 p-3 bg-gray-50 rounded-md space-y-3 text-sm">
              <!-- Strength Indicator -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <p class="font-medium text-gray-700">Password Strength:</p>
                  <span class="text-xs font-medium" class:text-red-600={requirementsMet <= 2} class:text-yellow-600={requirementsMet === 3} class:text-blue-600={requirementsMet === 4} class:text-green-600={requirementsMet === 5}>
                    {strengthLabel}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300 {strengthColor}" 
                    style="width: {strengthPercentage}%"
                  ></div>
                </div>
              </div>
              
              <!-- Requirements Checklist -->
              <div>
                <p class="font-medium text-gray-700 mb-2">Requirements ({requirementsMet}/5):</p>
                <div class="space-y-1.5">
                <div class="flex items-center gap-2">
                  {#if hasMinLength}
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  {:else}
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                  {/if}
                  <span class:text-green-600={hasMinLength} class:text-gray-600={!hasMinLength}>
                    At least 8 characters
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  {#if hasLowercase}
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  {:else}
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                  {/if}
                  <span class:text-green-600={hasLowercase} class:text-gray-600={!hasLowercase}>
                    One lowercase letter (a-z)
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  {#if hasUppercase}
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  {:else}
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                  {/if}
                  <span class:text-green-600={hasUppercase} class:text-gray-600={!hasUppercase}>
                    One uppercase letter (A-Z)
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  {#if hasNumber}
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  {:else}
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                  {/if}
                  <span class:text-green-600={hasNumber} class:text-gray-600={!hasNumber}>
                    One number (0-9)
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  {#if hasSpecial}
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  {:else}
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                  {/if}
                  <span class:text-green-600={hasSpecial} class:text-gray-600={!hasSpecial}>
                    One special character (!@#$%^&*...)
                  </span>
                </div>
                </div>
              </div>
            </div>
          {/if}
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div class="mt-1 relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autocomplete="new-password"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
              placeholder="••••••••"
              bind:value={confirmPassword}
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              on:click={() => togglePasswordVisibility('confirm')}
            >
              {#if showConfirmPassword}
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

          {#if confirmPassword && password !== confirmPassword}
            <p class="mt-2 text-sm text-red-600">Passwords do not match</p>
          {/if}
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
            Creating Account...
          {:else}
            Create Account
          {/if}
        </button>
      </div>

      <!-- OAuth Social Login -->
      <OAuthButtons mode="signup" />

      <div class="text-center">
        <p class="text-sm text-gray-600">
          Already have an account?
          <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </a>
        </p>
      </div>
    </form>
  </div>
</div>
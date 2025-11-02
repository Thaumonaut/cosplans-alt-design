<script lang="ts">
  import { authService } from '$lib/auth/auth-service';
  import { supabase } from '$lib/supabase';
  import OAuthButtons from '$lib/components/auth/OAuthButtons.svelte';
  import { Eye, EyeOff } from 'lucide-svelte';
  import Logo from '$lib/components/Logo.svelte';

  let isLoading = $state(false);
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);

  // Form data
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let error = $state('');
  let success = $state('');

  // Password strength validation - use actual password for immediate feedback
  const hasMinLength = $derived(password.length >= 8);
  const hasLowercase = $derived(/[a-z]/.test(password));
  const hasUppercase = $derived(/[A-Z]/.test(password));
  const hasNumber = $derived(/[0-9]/.test(password));
  const hasSpecial = $derived(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password));
  const isPasswordValid = $derived(hasMinLength && hasLowercase && hasUppercase && hasNumber && hasSpecial);
  const passwordsMatch = $derived(password === confirmPassword && confirmPassword.length > 0);
  
  // Calculate password strength (0-5 requirements met)
  const requirementsMet = $derived([hasMinLength, hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length);
  const strengthPercentage = $derived((requirementsMet / 5) * 100);
  const strengthColor = $derived(requirementsMet <= 2 ? 'bg-red-500' : requirementsMet <= 3 ? 'bg-yellow-500' : requirementsMet === 4 ? 'bg-blue-500' : 'bg-green-500');
  const strengthLabel = $derived(requirementsMet <= 2 ? 'Weak' : requirementsMet <= 3 ? 'Fair' : requirementsMet === 4 ? 'Good' : 'Strong');
  
  // Validation messages for button tooltip
  const validationMessages = $derived.by(() => {
    const messages: string[] = [];
    if (!email.trim()) messages.push('Email is required');
    if (!firstName.trim()) messages.push('First name is required');
    if (!lastName.trim()) messages.push('Last name is required');
    if (!isPasswordValid) {
      if (!hasMinLength) messages.push('Password must be at least 8 characters');
      if (!hasLowercase) messages.push('Password must contain a lowercase letter');
      if (!hasUppercase) messages.push('Password must contain an uppercase letter');
      if (!hasNumber) messages.push('Password must contain a number');
      if (!hasSpecial) messages.push('Password must contain a special character');
    }
    if (!passwordsMatch) messages.push('Passwords must match');
    return messages;
  });
  
  // Form validation
  const isFormValid = $derived(email && firstName && lastName && isPasswordValid && passwordsMatch);

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
        // Setup user profile and personal team automatically after successful signup
        if (result.user) {
          try {
            // Call database function to create user profile and personal team
            // The function defaults to auth.uid(), but we pass explicitly to be sure
            const { data, error: setupError } = await (supabase.rpc as any)('setup_new_user', {
              p_user_id: result.user.id
            });
            
            if (setupError) {
              console.warn('Failed to setup user profile and team on signup:', setupError);
              // Don't fail signup if setup fails - user can still verify email and login
            }
          } catch (setupError) {
            // Log but don't fail signup if setup fails
            console.warn('Failed to setup user on signup:', setupError);
          }
        }
        
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
    <div class="text-center">
      <a href="/" class="inline-flex items-center gap-2 justify-center mb-6 hover:opacity-80 transition-opacity">
        <Logo size="xl" />
      </a>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Start planning your photoshoots with Cosplans
      </p>
    </div>

    <form class="mt-8 space-y-6" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
              class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
              onclick={() => togglePasswordVisibility('password')}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {#if showPassword}
                <EyeOff class="h-5 w-5 text-gray-400" />
              {:else}
                <Eye class="h-5 w-5 text-gray-400" />
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
              class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
              onclick={() => togglePasswordVisibility('confirm')}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {#if showConfirmPassword}
                <EyeOff class="h-5 w-5 text-gray-400" />
              {:else}
                <Eye class="h-5 w-5 text-gray-400" />
              {/if}
            </button>
          </div>

          {#if confirmPassword && password !== confirmPassword}
            <p class="mt-2 text-sm text-red-600">Passwords do not match</p>
          {/if}
        </div>
      </div>

      <div class="space-y-2">
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!isFormValid ? validationMessages.join(', ') : ''}
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
        {#if !isFormValid && (email || firstName || lastName || password || confirmPassword)}
          <p class="text-xs text-gray-500 text-center">
            {validationMessages.join(', ')}
          </p>
        {/if}
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
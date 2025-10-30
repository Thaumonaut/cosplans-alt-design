<script lang="ts">
  import { authService } from '$lib/auth/auth-service';
  
  let { mode = 'login', redirectTo = '/dashboard' }: { 
    mode?: 'login' | 'signup'; 
    redirectTo?: string; 
  } = $props();
  
  let loading = false;
  let error: string | null = null;
  
  type OAuthProvider = 'google' | 'facebook' | 'twitter';
  
  async function handleOAuthLogin(provider: OAuthProvider) {
    loading = true;
    error = null;
    
    try {
      const result = await authService.signInWithOAuth(provider);
      
      if (result.error) {
        console.error(`${provider} OAuth error:`, result.error);
        error = `Failed to sign in with ${provider}. Please try again.`;
        loading = false;
        return;
      }
      
      // OAuth redirect will happen automatically
      // No need to manually redirect here
    } catch (err) {
      console.error(`${provider} OAuth error:`, err);
      error = `An error occurred. Please try again.`;
      loading = false;
    }
  }
</script>

<div class="oauth-buttons">
  {#if error}
    <div class="error-message" role="alert">
      {error}
    </div>
  {/if}
  
  <div class="divider">
    <span>Or {mode === 'login' ? 'sign in' : 'sign up'} with</span>
  </div>
  
  <div class="button-group">
    <!-- Google OAuth -->
    <button
      type="button"
      class="oauth-button google"
      on:click={() => handleOAuthLogin('google')}
      disabled={loading}
      aria-label="Sign in with Google"
    >
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Google</span>
    </button>
    
    <!-- Facebook/Instagram OAuth -->
    <button
      type="button"
      class="oauth-button facebook"
      on:click={() => handleOAuthLogin('facebook')}
      disabled={loading}
      aria-label="Sign in with Facebook"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      <span>Facebook</span>
    </button>
    
    <!-- Twitter/X OAuth -->
    <button
      type="button"
      class="oauth-button twitter"
      on:click={() => handleOAuthLogin('twitter')}
      disabled={loading}
      aria-label="Sign in with X (Twitter)"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
      <span>X (Twitter)</span>
    </button>
  </div>
  
  {#if loading}
    <div class="loading-overlay">
      <div class="spinner" aria-label="Loading"></div>
      <p>Redirecting to authentication...</p>
    </div>
  {/if}
</div>

<style>
  .oauth-buttons {
    width: 100%;
    position: relative;
  }
  
  .error-message {
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    background-color: #fee;
    border: 1px solid #fcc;
    border-radius: 0.375rem;
    color: #c33;
    font-size: 0.875rem;
  }
  
  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 1.5rem 0;
    color: #666;
    font-size: 0.875rem;
  }
  
  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
  }
  
  .divider span {
    padding: 0 1rem;
  }
  
  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .oauth-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 0.375rem;
    background-color: white;
    color: #333;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .oauth-button:hover:not(:disabled) {
    background-color: #f9f9f9;
    border-color: #bbb;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .oauth-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }
  
  .oauth-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .oauth-button .icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  
  .oauth-button.google {
    border-color: #4285F4;
  }
  
  .oauth-button.google:hover:not(:disabled) {
    background-color: #f0f7ff;
    border-color: #4285F4;
  }
  
  .oauth-button.facebook {
    border-color: #1877F2;
  }
  
  .oauth-button.facebook:hover:not(:disabled) {
    background-color: #f0f5ff;
    border-color: #1877F2;
  }
  
  .oauth-button.twitter {
    border-color: #000;
  }
  
  .oauth-button.twitter:hover:not(:disabled) {
    background-color: #f5f5f5;
    border-color: #000;
  }
  
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    border-radius: 0.375rem;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #4285F4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading-overlay p {
    color: #666;
    font-size: 0.875rem;
  }
  
  /* Mobile responsive */
  @media (max-width: 640px) {
    .oauth-button {
      font-size: 0.875rem;
      padding: 0.625rem 0.875rem;
    }
    
    .oauth-button .icon {
      width: 18px;
      height: 18px;
    }
  }
</style>
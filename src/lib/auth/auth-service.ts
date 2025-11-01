import { supabase } from '$lib/supabase';
import type { 
  AuthenticationService, 
  LoginCredentials, 
  SignupData, 
  AuthResult, 
  OAuthProvider 
} from '$lib/types/auth';

class SupabaseAuthService implements AuthenticationService {
  async signIn(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message,
        };
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
      };
    }
  }

  async signUp(data: SignupData): Promise<AuthResult> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message,
        };
      }

      return {
        user: authData.user,
        session: authData.session,
        error: null,
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
      };
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return {
        error: error ? error.message : null,
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
      };
    }
  }

  async signInWithOAuth(provider: OAuthProvider, redirectTo?: string): Promise<AuthResult> {
    try {
      // Store the redirect destination in localStorage before OAuth redirect
      // OAuth providers may strip query parameters, so we need a reliable way to preserve this
      const destination = redirectTo || '/dashboard';
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('oauth_redirect_to', destination);
        } catch (e) {
          console.warn('Failed to store OAuth redirect destination:', e);
        }
      }

      // Build callback URL using current origin (works for localhost, staging, production)
      // Supabase will validate this against allowed redirect URLs in dashboard
      const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
      
      console.log('[OAuth] Initiating OAuth flow:', {
        provider,
        origin: window.location.origin,
        redirectTo: destination,
        callbackUrl: callbackUrl.toString()
      });
      
      // Also include in query params as fallback (some providers preserve it)
      if (redirectTo) {
        callbackUrl.searchParams.set('next', redirectTo);
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // Use the full callback URL - Supabase validates this against allowed URLs
          redirectTo: callbackUrl.toString(),
          // Use queryParams to pass through custom data that Supabase will preserve
          queryParams: {
            ...(redirectTo && { next: redirectTo })
          },
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message,
        };
      }

      // OAuth redirects, so we won't have immediate user/session data
      return {
        user: null,
        session: null,
        error: null,
      };
    } catch (err) {
      return {
        user: null,
        session: null,
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
      };
    }
  }

  async getSession() {
    // Use getUser() instead of getSession() for security (validates JWT)
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return null;
    }

    // Return a minimal session with validated user
    return { user: userData.user };
  }

  async refreshSession() {
    const { data: { session } } = await supabase.auth.refreshSession();
    return session;
  }
}

// Export singleton instance
export const authService = new SupabaseAuthService();
import { writable, derived } from 'svelte/store';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '$lib/types/auth';

// Core authentication state
export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const loading = writable<boolean>(true);

// Derived stores for convenience
export const isAuthenticated = derived(
  [user, session],
  ([$user, $session]) => !!$user && !!$session
);

export const userProfile = derived(
  user,
  ($user): UserProfile | null => {
    if (!$user) return null;
    
    return {
      id: $user.id,
      email: $user.email || '',
      firstName: $user.user_metadata?.first_name || '',
      lastName: $user.user_metadata?.last_name || '',
      avatarUrl: $user.user_metadata?.avatar_url || '',
      createdAt: $user.created_at || '',
      updatedAt: $user.updated_at || '',
    };
  }
);

// Authentication actions
export const authActions = {
  setUser: (newUser: User | null) => {
    user.set(newUser);
  },
  
  setSession: (newSession: Session | null) => {
    session.set(newSession);
  },
  
  setLoading: (isLoading: boolean) => {
    loading.set(isLoading);
  },
  
  clear: () => {
    user.set(null);
    session.set(null);
    loading.set(false);
  },
  
  initialize: (initialUser: User | null, initialSession: Session | null) => {
    user.set(initialUser);
    session.set(initialSession);
    loading.set(false);
  },
};
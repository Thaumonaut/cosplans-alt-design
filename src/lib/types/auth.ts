import type { User, Session } from '@supabase/supabase-js';

// OAuth Provider types
export type OAuthProvider = 'google' | 'facebook' | 'twitter';

// Authentication result type
export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: string | null;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Signup data
export interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Password reset data
export interface PasswordResetData {
  email: string;
}

// Authentication service interface
export interface AuthenticationService {
  // Core authentication methods
  signIn(credentials: LoginCredentials): Promise<AuthResult>;
  signUp(data: SignupData): Promise<AuthResult>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<{ error: string | null }>;
  
  // OAuth methods
  signInWithOAuth(provider: OAuthProvider): Promise<AuthResult>;
  
  // Session management
  getSession(): Promise<Session | null>;
  refreshSession(): Promise<Session | null>;
}

// User profile data
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
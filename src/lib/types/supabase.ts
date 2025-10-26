// Database types for Supabase integration
// This file contains the TypeScript types for our Supabase database schema

export interface Database {
  public: {
    Tables: {
      // User and Team Management
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          owner_id?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member' | 'viewer';
          joined_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          joined_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          updated_at?: string;
        };
      };
      // Characters and Resources
      characters: {
        Row: {
          id: string;
          name: string;
          series: string;
          source_medium: 'anime' | 'manga' | 'game' | 'movie' | 'tv' | 'book' | 'original';
          team_id: string;
          reference_images: string[];
          budget_mode: 'personal' | 'commission';
          budget_limit: number | null;
          completion_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          series: string;
          source_medium: 'anime' | 'manga' | 'game' | 'movie' | 'tv' | 'book' | 'original';
          team_id: string;
          reference_images?: string[];
          budget_mode?: 'personal' | 'commission';
          budget_limit?: number | null;
          completion_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          series?: string;
          source_medium?: 'anime' | 'manga' | 'game' | 'movie' | 'tv' | 'book' | 'original';
          reference_images?: string[];
          budget_mode?: 'personal' | 'commission';
          budget_limit?: number | null;
          completion_percentage?: number;
          updated_at?: string;
        };
      };
      // Dashboard Widgets
      dashboard_widgets: {
        Row: {
          id: string;
          type: string;
          user_id: string;
          team_id: string;
          template: string;
          position: number;
          visible: boolean;
          settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          user_id: string;
          team_id: string;
          template?: string;
          position?: number;
          visible?: boolean;
          settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: string;
          template?: string;
          position?: number;
          visible?: boolean;
          settings?: Record<string, unknown>;
          updated_at?: string;
        };
      };
    };
    Views: {
      // Add views here as needed
    };
    Functions: {
      // Add functions here as needed
    };
  };
}

// Type aliases for convenience
export type User = Database['public']['Tables']['users']['Row'];
export type Team = Database['public']['Tables']['teams']['Row'];
export type TeamMember = Database['public']['Tables']['team_members']['Row'];
export type Character = Database['public']['Tables']['characters']['Row'];
export type DashboardWidget = Database['public']['Tables']['dashboard_widgets']['Row'];

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type TeamInsert = Database['public']['Tables']['teams']['Insert'];
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];
export type CharacterInsert = Database['public']['Tables']['characters']['Insert'];
export type DashboardWidgetInsert = Database['public']['Tables']['dashboard_widgets']['Insert'];

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type TeamUpdate = Database['public']['Tables']['teams']['Update'];
export type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update'];
export type CharacterUpdate = Database['public']['Tables']['characters']['Update'];
export type DashboardWidgetUpdate = Database['public']['Tables']['dashboard_widgets']['Update'];
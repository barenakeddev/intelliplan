export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      tests: {
        Row: {
          id: number;
          status: boolean;
        };
        Insert: {
          id: number;
          status: boolean;
        };
        Update: {
          id?: number;
          status?: boolean;
        };
      };
      conversations: {
        Row: {
          created_at: string;
          event_id: string | null;
          id: string;
          last_updated: string;
          name: string | null;
          snippet: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          event_id?: string | null;
          id?: string;
          last_updated?: string;
          name?: string | null;
          snippet?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          event_id?: string | null;
          id?: string;
          last_updated?: string;
          name?: string | null;
          snippet?: string | null;
          user_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]; 
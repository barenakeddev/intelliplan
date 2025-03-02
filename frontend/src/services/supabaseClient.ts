import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your_supabase_url') && 
  !supabaseAnonKey.includes('your_supabase_anon_key');

// Create a mock Supabase client for development
const createMockClient = () => {
  console.warn('Using mock Supabase client. Set up proper credentials for production use.');
  
  // Return an object that mimics the Supabase client interface
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ 
        data: { 
          subscription: { unsubscribe: () => {} } 
        } 
      }),
      signInWithPassword: () => Promise.resolve({ error: null }),
      signUp: () => Promise.resolve({ error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({
        order: () => ({
          then: (callback: Function) => callback({ data: [], error: null })
        })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    })
  };
};

// Export either a real Supabase client or a mock client
export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any; 
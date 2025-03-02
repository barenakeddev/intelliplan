import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && supabaseKey && 
  !supabaseUrl.includes('your_supabase_url') && 
  !supabaseKey.includes('your_supabase_service_key');

if (!hasValidCredentials) {
  console.warn('Warning: Invalid or missing Supabase credentials. Some functionality may not work correctly.');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey); 
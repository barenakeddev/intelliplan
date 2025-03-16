import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Database } from './types';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase URL or key. Check your .env file.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Function to check database connection
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('tests').select('status').eq('id', 1);
    if (error) {
      console.error("Error connecting to the database:", error.message);
      return false;
    }
    console.log("Database connection successful:");
    return true;
  } catch (error: any) {
    console.error("Error during database connection test:", error.message);
    return false;
  }
}; 
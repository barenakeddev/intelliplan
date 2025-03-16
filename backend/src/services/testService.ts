import { supabase } from '../utils/supabaseClient';
import { ErrorTypes } from '../utils/errorHandler';

/**
 * Retrieves the status from the test table
 */
export const getTestStatus = async () => {
  try {
    const { data, error } = await supabase.from('tests').select('status').eq('id', 1).single();
    
    if (error) {
      throw ErrorTypes.Database(`Failed to get test status: ${error.message}`, true);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw ErrorTypes.Database(`Error in getTestStatus: ${error.message}`, false);
    }
    throw error;
  }
}; 
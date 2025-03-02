import { Request, Response } from 'express';
import { generateRFP } from '../services/rfpService';
import { supabase } from '../utils/supabaseClient';
import { ParsedEventData } from '../services/nlpService';

/**
 * Generates an RFP based on parsed event data
 * @param req Express request object
 * @param res Express response object
 */
export async function generateRFPController(req: Request, res: Response) {
  try {
    const { parsedData, eventId, userId } = req.body;
    
    if (!parsedData) {
      return res.status(400).json({ error: 'Parsed event data is required' });
    }
    
    // Generate RFP
    const rfpText = await generateRFP(parsedData as ParsedEventData);
    
    // If eventId and userId are provided, save to Supabase
    if (eventId && userId) {
      try {
        // Check if the event belongs to the user
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('id')
          .eq('id', eventId)
          .eq('user_id', userId)
          .single();
        
        if (eventError || !eventData) {
          console.error('Error verifying event ownership:', eventError);
          return res.status(403).json({ error: 'Not authorized to access this event' });
        }
        
        // Insert RFP into Supabase
        const { error: rfpError } = await supabase
          .from('rfps')
          .insert({
            event_id: eventId,
            rfp_text: rfpText
          });
        
        if (rfpError) {
          console.error('Error saving RFP to Supabase:', rfpError);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }
    
    return res.status(200).json({ rfp: rfpText });
  } catch (error) {
    console.error('Error in generateRFP controller:', error);
    return res.status(500).json({ error: 'Failed to generate RFP' });
  }
} 
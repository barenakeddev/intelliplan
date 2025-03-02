import { Request, Response } from 'express';
import { parseEventDescription } from '../services/nlpService';
import { supabase } from '../utils/supabaseClient';

/**
 * Parses an event description and returns structured data
 * @param req Express request object
 * @param res Express response object
 */
export async function parseDescription(req: Request, res: Response) {
  try {
    const { description, userId } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Event description is required' });
    }
    
    // Parse the event description
    const parsedData = await parseEventDescription(description);
    
    // If userId is provided, save to Supabase
    if (userId) {
      try {
        // Insert event into Supabase
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .insert({
            user_id: userId,
            original_description: description,
            parsed_data: parsedData
          })
          .select('id')
          .single();
        
        if (eventError) {
          console.error('Error saving event to Supabase:', eventError);
        } else if (eventData) {
          // Create a conversation entry for this event
          const snippet = description.length > 100 
            ? description.substring(0, 97) + '...' 
            : description;
            
          const { error: conversationError } = await supabase
            .from('conversations')
            .insert({
              event_id: eventData.id,
              snippet
            });
            
          if (conversationError) {
            console.error('Error creating conversation:', conversationError);
          }
          
          // Return the event ID along with parsed data
          return res.status(200).json({ 
            parsedData, 
            eventId: eventData.id,
            language: 'en' // Default to English for now
          });
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }
    
    // If no userId or there was an error saving, just return the parsed data
    return res.status(200).json({ 
      parsedData,
      language: 'en' // Default to English for now
    });
  } catch (error) {
    console.error('Error in parseDescription controller:', error);
    return res.status(500).json({ error: 'Failed to parse event description' });
  }
} 
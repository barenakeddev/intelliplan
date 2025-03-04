import { Request, Response } from 'express';
import { parseEventDescription, detectLanguage, translateText } from '../services/nlpService';
import { supabase } from '../utils/supabaseClient';

/**
 * Parses an event description to extract structured data
 * @param req Express request object
 * @param res Express response object
 */
export async function parseDescriptionController(req: Request, res: Response) {
  try {
    const { description, userId } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    // Detect language
    const detectedLanguage = await detectLanguage(description);
    
    // Translate if not in English
    let processedDescription = description;
    if (detectedLanguage !== 'en') {
      processedDescription = await translateText(description, 'en');
    }
    
    // Parse the description
    const parsedData = await parseEventDescription(processedDescription);
    
    return res.status(200).json({
      parsedData,
      originalLanguage: detectedLanguage,
      wasTranslated: detectedLanguage !== 'en'
    });
  } catch (error) {
    console.error('Error in parseDescription controller:', error);
    return res.status(500).json({ error: 'Failed to parse description' });
  }
}

/**
 * Extracts information from a conversation message
 * @param req Express request object
 * @param res Express response object
 */
export async function extractInfoFromMessageController(req: Request, res: Response) {
  try {
    const { message, currentInfo, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Detect language
    const detectedLanguage = await detectLanguage(message);
    
    // Translate if not in English
    let processedMessage = message;
    if (detectedLanguage !== 'en') {
      processedMessage = await translateText(message, 'en');
    }
    
    // Create a prompt for the AI to extract information
    const prompt = `
      The user has provided this message about their event: "${processedMessage}"
      
      Based on this message, extract any relevant event planning information.
      
      Current information we have:
      ${JSON.stringify(currentInfo || {}, null, 2)}
      
      Update the information object with any new details from the user's message.
      Return ONLY a JSON object with the updated information.
    `;
    
    // Use the NLP service to extract information
    const updatedInfo = await parseEventDescription(prompt);
    
    return res.status(200).json({
      updatedInfo,
      originalLanguage: detectedLanguage,
      wasTranslated: detectedLanguage !== 'en'
    });
  } catch (error) {
    console.error('Error in extractInfoFromMessage controller:', error);
    return res.status(500).json({ error: 'Failed to extract information from message' });
  }
}

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

/**
 * Controller for parsing event descriptions
 * @param req Express request object
 * @param res Express response object
 */
export async function parseEventDescriptionController(req: Request, res: Response) {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Event description is required' });
    }
    
    // Parse the event description
    const parsedData = await parseEventDescription(description);
    
    return res.status(200).json({ parsedData });
  } catch (error) {
    console.error('Error parsing event description:', error);
    return res.status(500).json({ error: 'Failed to parse event description' });
  }
} 
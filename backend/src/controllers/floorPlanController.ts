import { Request, Response } from 'express';
import { generateFloorPlan } from '../services/floorPlanService';
import { supabase } from '../utils/supabaseClient';
import { ParsedEventData } from '../services/nlpService';

/**
 * Generates a floor plan based on parsed event data
 * @param req Express request object
 * @param res Express response object
 */
export async function generateFloorPlanController(req: Request, res: Response) {
  try {
    const { parsedData, eventId, userId } = req.body;
    
    if (!parsedData) {
      return res.status(400).json({ error: 'Parsed event data is required' });
    }
    
    // Generate floor plan
    const floorPlan = await generateFloorPlan(parsedData as ParsedEventData);
    
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
        
        // Insert floor plan into Supabase
        const { error: floorPlanError } = await supabase
          .from('floor_plans')
          .insert({
            event_id: eventId,
            layout: { elements: floorPlan.elements },
            venue_dimensions: floorPlan.venueDimensions
          });
        
        if (floorPlanError) {
          console.error('Error saving floor plan to Supabase:', floorPlanError);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }
    
    return res.status(200).json(floorPlan);
  } catch (error) {
    console.error('Error in generateFloorPlan controller:', error);
    return res.status(500).json({ error: 'Failed to generate floor plan' });
  }
}

export async function updateFloorPlanController(req: Request, res: Response) {
  try {
    const { floorPlanId, layout } = req.body;

    if (!floorPlanId || !layout) {
      return res.status(400).json({ error: 'Floor plan ID and layout are required' });
    }

    // Update floor plan in database
    const { data, error } = await supabase
      .from('floorplans')
      .update({
        layout,
      })
      .eq('id', floorPlanId)
      .select();

    if (error) {
      console.error('Error updating floor plan:', error);
      return res.status(500).json({ error: 'Failed to update floor plan' });
    }

    return res.status(200).json({
      success: true,
      floorPlan: data && data.length > 0 ? data[0] : null
    });
  } catch (error) {
    console.error('Error in updateFloorPlan controller:', error);
    return res.status(500).json({ error: 'Failed to update floor plan' });
  }
} 
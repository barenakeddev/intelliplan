"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRFPController = generateRFPController;
exports.modifyRFPController = modifyRFPController;
const rfpService_1 = require("../services/rfpService");
const supabaseClient_1 = require("../utils/supabaseClient");
/**
 * Generates an RFP based on parsed event data
 * @param req Express request object
 * @param res Express response object
 */
function generateRFPController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { parsedData, eventId, userId } = req.body;
            if (!parsedData) {
                return res.status(400).json({ error: 'Parsed event data is required' });
            }
            // Generate RFP
            const rfpText = yield (0, rfpService_1.generateRFP)(parsedData);
            // If eventId and userId are provided, save to Supabase
            if (eventId && userId) {
                try {
                    // Check if the event belongs to the user
                    const { data: eventData, error: eventError } = yield supabaseClient_1.supabase
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
                    const { error: rfpError } = yield supabaseClient_1.supabase
                        .from('rfps')
                        .insert({
                        event_id: eventId,
                        rfp_text: rfpText
                    });
                    if (rfpError) {
                        console.error('Error saving RFP to Supabase:', rfpError);
                    }
                }
                catch (dbError) {
                    console.error('Database error:', dbError);
                }
            }
            return res.status(200).json({ rfp: rfpText });
        }
        catch (error) {
            console.error('Error in generateRFP controller:', error);
            return res.status(500).json({ error: 'Failed to generate RFP' });
        }
    });
}
/**
 * Modifies an RFP based on a user prompt
 * @param req Express request object
 * @param res Express response object
 */
function modifyRFPController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { currentRFP, prompt, eventId, userId, rfpId, isNewRfp } = req.body;
            if (!prompt) {
                return res.status(400).json({ error: 'Prompt is required' });
            }
            // Log the request for debugging
            console.log(`Modifying RFP for event ${eventId} with prompt: ${prompt}`);
            let modifiedRFP;
            // If this is a new RFP or the current RFP is empty, generate a new one from the prompt
            if (isNewRfp || !currentRFP || currentRFP.trim() === '') {
                console.log('Creating new RFP from prompt');
                // Create a template RFP
                const templateRFP = `# Request for Proposal
  
  Event name: 
  Event type: 
  Preferred Date: 
  Alternative Date: 
  Dates flexible? (yes/no): 
  Attendee number: 
  
  ## Event Requirements
  
  ### Venue Requirements
  - **Main Venue Space (sqft):**
  #### Room Details
  Fill in the details for each room (add or remove rows as needed):
  | Function           | Space Required (sqft) | Seating Arrangement      | Additional Details |
  | ------------------ | --------------------- | ------------------------ | ------------------ |
  |                    |                       |                          |                    |
  
  ### Catering Requirements
  - **Service Style (plated or buffet):**
  - **Meal Periods (e.g., Lunch, 2 breaks):**
  - **Beverage Service (e.g., Coffee, Tea):**
  - **Special Requests (if any):**
  
  ### Audio/Visual Requirements
  - **Equipment Needed:**
  - **Internet Access:**
  
  ### Additional Requirements
  - Any other special requirements or notes:
`;
                // Generate RFP from prompt
                modifiedRFP = yield (0, rfpService_1.modifyRFPWithAI)(templateRFP, `Create an initial RFP based on this description: ${prompt}`);
            }
            else {
                // Modify existing RFP
                modifiedRFP = yield (0, rfpService_1.modifyRFPWithAI)(currentRFP, prompt);
            }
            // If eventId is provided, save to Supabase
            if (eventId) {
                try {
                    // Check if RFP exists
                    const { data: existingRFP, error: fetchError } = yield supabaseClient_1.supabase
                        .from('rfps')
                        .select('*')
                        .eq('event_id', eventId)
                        .maybeSingle();
                    if (fetchError) {
                        console.error('Error fetching RFP:', fetchError);
                    }
                    else if (existingRFP) {
                        // Update existing RFP
                        const { error: updateError } = yield supabaseClient_1.supabase
                            .from('rfps')
                            .update({ rfp_text: modifiedRFP })
                            .eq('id', existingRFP.id);
                        if (updateError) {
                            console.error('Error updating RFP:', updateError);
                        }
                        else {
                            console.log(`Successfully updated RFP for event ${eventId}`);
                        }
                    }
                    else {
                        // Create new RFP if it doesn't exist
                        const { error: insertError } = yield supabaseClient_1.supabase
                            .from('rfps')
                            .insert(Object.assign({ event_id: eventId, rfp_text: modifiedRFP }, (userId ? { user_id: userId } : {})));
                        if (insertError) {
                            console.error('Error creating new RFP:', insertError);
                        }
                        else {
                            console.log(`Successfully created new RFP for event ${eventId}`);
                        }
                    }
                }
                catch (dbError) {
                    console.error('Error saving RFP to database:', dbError);
                }
            }
            return res.status(200).json({ modifiedRFP });
        }
        catch (error) {
            console.error('Error in modifyRFP controller:', error);
            return res.status(500).json({ error: 'Failed to modify RFP' });
        }
    });
}

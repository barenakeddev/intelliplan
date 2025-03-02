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
exports.modifyRFPController = exports.generateRFPController = void 0;
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
 * Modifies an existing RFP based on user prompt
 * @param req Express request object
 * @param res Express response object
 */
function modifyRFPController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { rfpText, prompt, eventId, userId, rfpId } = req.body;
            
            if (!rfpText || !prompt) {
                return res.status(400).json({ error: 'RFP text and prompt are required' });
            }
            
            // Call the service to modify the RFP
            const modifiedRfp = yield (0, rfpService_1.modifyRFP)(rfpText, prompt);
            
            // If eventId, userId, and rfpId are provided, update in Supabase
            if (eventId && userId && rfpId) {
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
                    
                    // Update RFP in Supabase
                    const { error: rfpError } = yield supabaseClient_1.supabase
                        .from('rfps')
                        .update({ rfp_text: modifiedRfp })
                        .eq('id', rfpId)
                        .eq('event_id', eventId);
                        
                    if (rfpError) {
                        console.error('Error updating RFP in Supabase:', rfpError);
                    }
                } catch (dbError) {
                    console.error('Database error:', dbError);
                }
            }
            
            return res.status(200).json({ rfp: modifiedRfp });
        } catch (error) {
            console.error('Error in modifyRFP controller:', error);
            return res.status(500).json({ error: 'Failed to modify RFP' });
        }
    });
}
exports.modifyRFPController = modifyRFPController;
